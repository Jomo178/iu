const { CommandInteraction, Client, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const mongoose = require('mongoose');
const Users = require("../../models/user.js");
const verifyCD = require("../../functions/verifyCooldown.js");
const Card = require("../../models/card.js");
const Canvas = require("@napi-rs/canvas");
const path = require('path');
const getRarity = require("../../functions/getRarity.js");
const { drawRandomCards, getNextIssueNumber } = require('../../utils/cardUtils');
const axios = require('axios');
const Font = require("../../models/fonts.js");

module.exports = {
  name: "hunt",
  category: "card",
  description: "Hunt for 2 cards and choose 1 (with blurred image)",
  permissions: [""],
  run: async (client, interaction, args) => {
    let cards;

    try {
      const response = await axios.get('https://iu-website.vercel.app/api/get/cards?amount=all');
      cards = response.data;
    } catch (error) {
      return interaction.followUp({ content: 'Error fetching cards from the API.', ephemeral: true });
    }

    if (!cards[0] || !cards[1]) {
      return interaction.followUp({ content: 'Not enough cards available for the hunt.', ephemeral: true });
    }

    const [c1, c2] = await Promise.all([
      Canvas.loadImage(cards[0].image),
      Canvas.loadImage(cards[1].image),
    ]);
    const canvas = Canvas.createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');

    ctx.filter = 'blur(13px)';
    ctx.drawImage(c1, 0, 0, 600, 800);
    ctx.drawImage(c2, 600, 0, 600, 800);

    const fontFamily = 'Fjalla One';
    if (!Canvas.GlobalFonts.has(fontFamily)) {
      Canvas.GlobalFonts.registerFromPath(path.join(__dirname, '../../fonts/Fjalla One.ttf'), fontFamily);
    }

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('card1').setLabel('1').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('card2').setLabel('2').setStyle(ButtonStyle.Primary)
    );

    const attachment = new AttachmentBuilder()
      .setFile(await canvas.encode('webp'))
      .setName('blurredrop.webp');

    const embed = new EmbedBuilder()
      .setColor(`#C0C78C`)
      .setAuthor({
        name: `${interaction.user.tag} || Card Hunt`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(`<@${interaction.user.id}> is on the hunt for 2 cards! Choose wisely...`)
      .setImage('attachment://blurredrop.webp');

    const msg = await interaction.editReply({
      embeds: [embed],
      components: [buttons],
      files: [attachment],
    });

    const filter = i => i.user.id === interaction.user.id && i.message.id === msg.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
      collector.stop();

      let selectedCard = i.customId === 'card1' ? cards[0] : cards[1];

      if (!selectedCard) {
        await i.update({ content: 'No card was selected.', components: [] });
        return;
      }

      const captureChance = Math.random();
      if (captureChance < 0.5) {
        const escapeEmbed = new EmbedBuilder()
          .setColor('#86AB89')
          .setAuthor({
            name: `${interaction.user.tag} || Card Escaped`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setDescription('The card has run away!')
          .setImage('https://c.tenor.com/3RG1hxPfO8cAAAAC/tenor.gif');
        
        await i.update({ embeds: [escapeEmbed], components: [], files: [] });
        return;
      }

      const hi = Canvas.createCanvas(600, 800);
      const ctxHi = hi.getContext('2d');

      const selectedCardImage = await Canvas.loadImage(selectedCard.image);
      ctxHi.drawImage(selectedCardImage, 0, 0, hi.width, hi.height);

      let font;
      if (fontFamily) {
        font = await Font.findOne({ name: fontFamily }).lean().exec();
      }

      const isBigFont = font?.isBig || false;
      const defaultFontSize = isBigFont ? 65 : 75;
      const smallerFontSize = isBigFont ? 55 : 60;
      const actFontSize = 30;
      const actYOffset = isBigFont ? 5 : 0;

      ctxHi.fillStyle = 'white';
      ctxHi.strokeStyle = 'black';
      ctxHi.lineWidth = 6;

      const drawText = (text, x, y, fontSize) => {
        ctxHi.font = `${fontSize}px "${fontFamily || 'default'}"`;
        ctxHi.strokeText(text, x, y);
        ctxHi.fillText(text, x, y);
      };

      if (selectedCard.name.length > 7) {
        drawText(selectedCard.name, 84, 731, smallerFontSize);
        drawText(selectedCard.act, 84, 731 - (smallerFontSize - actYOffset), actFontSize);
      } else {
        drawText(selectedCard.name, 84, 731, defaultFontSize);
        drawText(selectedCard.act, 84, 731 - (defaultFontSize - actYOffset), actFontSize);
      }

      const attachmentHi = new AttachmentBuilder()
        .setFile(await hi.encode('webp'))
        .setName('hi.webp');

      let nextIssueNumber;
      try {
        nextIssueNumber = await getNextIssueNumber(selectedCard.name);
      } catch (error) {
        await i.update({ content: 'There was an error collecting your card.', components: [] });
        return;
      }

      const embedHi = new EmbedBuilder()
        .setColor(`#CBE2B5`)
        .setAuthor({ name: `${interaction.user.tag} || Hunt Success`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`<@${interaction.user.id}> has successfully hunted \`${selectedCard.code}#${nextIssueNumber}\` **${selectedCard.group}** __${selectedCard.name}__ ${selectedCard.rarity}`)
        .setImage('attachment://hi.webp');

      try {
        await Card.create({
          name: selectedCard.name,
          group: selectedCard.group,
          act: selectedCard.act,
          code: `${selectedCard.code}#${nextIssueNumber}`,
          image: selectedCard.image,
          owner: interaction.user.id,
          font: fontFamily,
          rarity: selectedCard.rarity,
        });

        await i.update({
          embeds: [embedHi],
          components: [],
          files: [attachmentHi],
        });
      } catch (error) {
        await i.update({ content: 'There was an error collecting your card.', components: [] });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'You took too long to choose a card! The hunt has ended.', components: [] });
      }
    });
  },
};
