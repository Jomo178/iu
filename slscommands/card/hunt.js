const { CommandInteraction, Client, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const mongoose = require('mongoose');
const Users = require("../../models/user.js");
const verifyCD = require("../../functions/verifyCooldown.js");
const Card = require("../../models/card.js");
const Canvas = require("@napi-rs/canvas");
const path = require('path');
const getRarity = require("../../functions/getRarity.js");
const { drawRandomCards, getNextIssueNumber } = require('../../utils/cardUtils');

module.exports = {
  name: "hunt",
  category: "card",
  description: "Hunt for 2 cards and choose 1 (with blurred image)",
  permissions: [""],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    let verify = await verifyCD(client, interaction, "hunt", 1800000); 
    if (verify) return;

    let cards = await drawRandomCards(2);

    const canvas = Canvas.createCanvas(1200, 800); 
    const ctx = canvas.getContext('2d');
    
    let c1 = await Canvas.loadImage(cards[0].image);
    let c2 = await Canvas.loadImage(cards[1].image);

    ctx.filter = 'blur(13px)'; 
    ctx.drawImage(c1, 0, 0, 600, 800); 
    ctx.drawImage(c2, 600, 0, 600, 800); 
    
    Canvas.GlobalFonts.registerFromPath(path.join(__dirname, '../../fonts/Fjalla One.ttf'), 'Fjalla One');
    const fontFamily = 'Fjalla One';

    ctx.font = `24px "${fontFamily}"`;
    ctx.fillStyle = '#ffffff'; 

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
  
      let selectedCard;
      switch (i.customId) {
        case 'card1':
          selectedCard = cards[0];
          break;
        case 'card2':
          selectedCard = cards[1];
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

      let selectedCardImage = await Canvas.loadImage(selectedCard.image);
      ctxHi.drawImage(selectedCardImage, 0, 0, hi.width, hi.height);

      const defaultFontSize = 80;
      const smallerFontSize = 65;
      const actFontSize = 35;
  
      ctxHi.strokeStyle = 'black'; 
      ctxHi.lineWidth = 6; 
  
      if (selectedCard.name.length > 7) {
        ctxHi.font = `${smallerFontSize}px "${fontFamily}"`; 
        ctxHi.fillStyle = 'white'; 
        ctxHi.strokeText(selectedCard.name, 80, 735); 
        ctxHi.fillText(selectedCard.name, 80, 735);
        
        ctxHi.font = `${actFontSize}px "${fontFamily}"`;
        ctxHi.strokeText(selectedCard.act, 80, 660 + (defaultFontSize - smallerFontSize));
        ctxHi.fillText(selectedCard.act, 80, 660 + (defaultFontSize - smallerFontSize));
      } else {
        ctxHi.font = `${defaultFontSize}px "${fontFamily}"`; 
        ctxHi.fillStyle = 'white'; 
        ctxHi.strokeText(selectedCard.name, 80, 735); 
        ctxHi.fillText(selectedCard.name, 80, 735); 

        ctxHi.font = `${actFontSize}px "${fontFamily}"`; 
        ctxHi.strokeText(selectedCard.act, 80, 660); 
        ctxHi.fillText(selectedCard.act, 80, 660);     
      }
      
      const attachmentHi = new AttachmentBuilder()
          .setFile(await hi.encode('webp')) 
          .setName('hi.webp');
        
      let nextIssueNumber;
      try {
        nextIssueNumber = await getNextIssueNumber(selectedCard.name);  
      } catch (error) {
        console.error('Error getting next issue number:', error);
        await i.update({ content: 'There was an error collecting your card.', components: [] });
        return;
      }
  
      const embedHi = new EmbedBuilder()
          .setColor(`#CBE2B5`)
          .setAuthor({ name: `${interaction.user.tag} || Hunt Success`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setDescription(`<@${interaction.user.id}> has successfully hunted \`${selectedCard.code}#${nextIssueNumber}\` **${selectedCard.group}** __${selectedCard.name}__ ${getRarity(selectedCard.value)}`)
          .setImage('attachment://hi.webp');
  
      try {
        const newCard = new Card({
          name: selectedCard.name,
          group: selectedCard.group,
          rarity: selectedCard.value, // Using `rarity` field instead of `value`
          act: selectedCard.act,
          owner: interaction.user.id,
          date: new Date().toISOString(),
          issue: nextIssueNumber,
          code: `${selectedCard.code}#${nextIssueNumber}`, 
          image: selectedCard.image,
          font: fontFamily  
        });
  
        await newCard.save(); // Save without transaction
  
        await i.update({
          embeds: [embedHi],
          components: [],
          files: [attachmentHi],
        });
      } catch (error) {
        console.error(error);
        await i.update({ content: 'There was an error collecting your card.', components: [] });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'You did not select a card in time.', components: [] });
      }
    });
  }
};
