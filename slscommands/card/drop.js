const { CommandInteraction, Client, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const mongoose = require('mongoose');
const Card = require("../../models/card.js");
const Canvas = require("@napi-rs/canvas");
const path = require('path');
const axios = require('axios');
const Font = require("../../models/fonts.js")
const { getNextIssueNumber } = require('../../utils/cardUtils');
const getRarity = require("../../functions/getRarity.js");

module.exports = {
  name: "drop",
  category: "card",
  description: "Drop 3 cards and choose 1",
  permissions: [""],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    let cards;
    try {
      const response = await axios.get('https://iu-website.vercel.app/api/get/cards?amount=3');
      cards = response.data;
    } catch (error) {
      console.error('Error fetching cards:', error);
      return interaction.followUp({ content: 'Error fetching cards from the API.', ephemeral: true });
    }

    const canvas = Canvas.createCanvas(1800, 800);
    const ctx = canvas.getContext('2d');

    try {
      const [c1, c2, c3] = await Promise.all([
          Canvas.loadImage(cards[0].image),
          Canvas.loadImage(cards[1].image),
          Canvas.loadImage(cards[2].image)
      ]);

      ctx.drawImage(c1, 0, 0, 600, 800);
      ctx.drawImage(c2, 600, 0, 600, 800);
      ctx.drawImage(c3, 1200, 0, 600, 800);
    } catch (error) {
      console.error('Error loading or drawing images:', error);
      return interaction.followUp({ content: 'Error processing card images.', ephemeral: true });
    }

    if (!global.fontRegistered) {
      Canvas.GlobalFonts.registerFromPath(path.join(__dirname, '../../fonts/Fjalla One.ttf'), 'Fjalla One');
      global.fontRegistered = true;
    }
    const fontFamily = 'Fjalla One';
    ctx.font = `24px "${fontFamily}"`;
    ctx.fillStyle = '#ffffff';

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('card1').setLabel('1').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('card2').setLabel('2').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('card3').setLabel('3').setStyle(ButtonStyle.Primary)
    );

    const attachment = new AttachmentBuilder()
      .setFile(await canvas.encode('webp'))
      .setName('drop.webp');

    const embed = new EmbedBuilder()
      .setColor(`#FFFED3`)
      .setAuthor({
        name: `${interaction.user.tag} || Drop`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`<@${interaction.user.id}> is dropping 3 cards!`)
      .setImage('attachment://drop.webp');

    const msg = await interaction.editReply({
      embeds: [embed],
      components: [buttons],
      files: [attachment],
    });

    const filter = i => i.user.id === interaction.user.id && i.message.id === msg.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
      collector.stop();

      let selectedCard;
      switch (i.customId) {
        case 'card1':
          selectedCard = cards[0];
          break;
        case 'card2':
          selectedCard = cards[1];
          break;
        case 'card3':
          selectedCard = cards[2];
          break;
        default:
          console.error('Invalid customId:', i.customId);
          await i.update({ content: 'An error occurred while selecting the card.', components: [] });
          return;
      }

      if (!selectedCard) {
        console.error('No card selected');
        await i.update({ content: 'No card was selected.', components: [] });
        return;
      }

      const hi = Canvas.createCanvas(600, 800);
      const ctxHi = hi.getContext('2d');

      let selectedCardImage;
      try {
        selectedCardImage = await Canvas.loadImage(selectedCard.image);
      } catch (error) {
        console.error('Error loading selected card image:', error);
        await i.update({ content: 'Error loading the selected card image.', components: [] });
        return;
      }

      ctxHi.drawImage(selectedCardImage, 0, 0, hi.width, hi.height);

      let isBigFont = false;
      if (fontFamily) {
        try {
          const font = await Font.findOne({ name: fontFamily });
          if (font) {
            Canvas.GlobalFonts.registerFromPath(path.join(__dirname, `../../fonts/${fontFamily}.ttf`), fontFamily);
            isBigFont = font.isBig;
          } else {
            console.warn(`Font ${fontFamily} not found.`);
          }
        } catch (error) {
          console.error('Error fetching font details:', error);
        }
      }

      const defaultFontSize = isBigFont ? 65 : 75;
      const smallerFontSize = isBigFont ? 55 : 60;
      const actFontSize = 30;
      const actYOffset = isBigFont ? 5 : 0;

      ctxHi.fillStyle = 'white'; 
      ctxHi.strokeStyle = 'black';
      ctxHi.lineWidth = 6;

      // Draw card name
      if (selectedCard.name.length > 7) {
        ctxHi.font = `${smallerFontSize}px "${fontFamily || 'default'}"`; 
        ctxHi.strokeText(selectedCard.name, 84, 731); 
        ctxHi.fillText(selectedCard.name, 84, 731); 

        ctxHi.font = `${actFontSize}px "${fontFamily || 'default'}"`;
        ctxHi.strokeText(selectedCard.act, 84, 731 - (smallerFontSize - actYOffset));
        ctxHi.fillText(selectedCard.act, 84, 731 - (smallerFontSize - actYOffset)); 
      } else {
        ctxHi.font = `${defaultFontSize}px "${fontFamily || 'default'}"`; 
        ctxHi.strokeText(selectedCard.name, 84, 731);
        ctxHi.fillText(selectedCard.name, 84, 731); 

        ctxHi.font = `${actFontSize}px "${fontFamily || 'default'}"`;
        ctxHi.strokeText(selectedCard.act, 84, 731 - (defaultFontSize - actYOffset)); 
        ctxHi.fillText(selectedCard.act, 84, 731 - (defaultFontSize - actYOffset)); 
      }
      
      const attachmentHi = new AttachmentBuilder()
          .setFile(await hi.encode('png')) 
          .setName('hi.png');

      let nextIssueNumber;
      try {
        nextIssueNumber = await getNextIssueNumber(selectedCard.name);
      } catch (error) {
        console.error('Error getting next issue number:', error);
        await i.update({ content: 'There was an error collecting your card.', components: [] });
        return;
      }

      const embedHi = new EmbedBuilder()
        .setColor(`#FFC6C6`)
        .setAuthor({ name: `${interaction.user.tag} || Drop Claimed`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`<@${interaction.user.id}> has claimed \`${selectedCard.code}#${nextIssueNumber}\` **${selectedCard.group}** __${selectedCard.name}__ ${getRarity(selectedCard.rarity)}`)
        .setImage('attachment://hi.png'); // Match the file name here with the attachment name

      const session = await mongoose.startSession();
      try {
        const newCard = new Card({
          name: selectedCard.name,
          group: selectedCard.group,
          rarity: selectedCard.rarity,
          act: selectedCard.act,
          owner: interaction.user.id,
          date: new Date().toISOString(),
          issue: nextIssueNumber,
          code: `${selectedCard.code}#${nextIssueNumber}`,
          image: selectedCard.image,
          font: fontFamily
        });

        await newCard.save({ session });

        await i.update({
          embeds: [embedHi],
          components: [],
          files: [attachmentHi],
        });
      } catch (error) {
        console.error('Error saving card:', error);
        await i.update({ content: 'There was an error collecting your card.', components: [] });
      } finally {
        session.endSession();
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'You did not select a card in time.', components: [] });
      }
    });
  }
};