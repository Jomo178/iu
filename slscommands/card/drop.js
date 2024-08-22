const { CommandInteraction, Client, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, codeBlock } = require("discord.js");
const mongoose = require('mongoose');
const Users = require("../../models/user.js");
const verifyCD = require("../../functions/verifyCooldown.js");
const Card = require("../../models/card.js");
const Canvas = require("@napi-rs/canvas");
const getRarity = require("../../functions/getRarity.js");
const { drawRandomCards, getNextIssueNumber } = require('../../utils/cardUtils');

module.exports = {
  name: "drop",
  category: "card",
  description: "drop 3 cards and choose 1",
  permissions: [""],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {

    let verify = await verifyCD(client, interaction, "drop", 1800000); 
    if (verify) return;

    let user = await Users.findOne({ user: interaction.user.id });
    const player = interaction.options.getUser("user") || interaction.user;

    let cards = await drawRandomCards(3);

    const canvas = Canvas.createCanvas(585, 290);
    const ctx = canvas.getContext("2d");

    let c1 = await Canvas.loadImage(cards[0].image);
    let c2 = await Canvas.loadImage(cards[1].image);
    let c3 = await Canvas.loadImage(cards[2].image);

    ctx.drawImage(c1, 13, 13, 179, 264);
    ctx.drawImage(c2, 204, 13, 179, 264);
    ctx.drawImage(c3, 395, 13, 179, 264);

    const attachment = new AttachmentBuilder()
      .setFile(await canvas.encode("png"))
      .setName("drop.png");

        var embed = new EmbedBuilder()
        .setColor(client.bot.color)
        .setAuthor({
          name: `${interaction.user.tag} || Drop`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(`<${interaction.user.id}> is dropping 3 cards!`)
        .setImage(`attachment://drop.png`);

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`card1`).setLabel(`1`).setStyle(1),
    
          new ButtonBuilder().setCustomId(`card2`).setLabel(`2`).setStyle(1),
    
          new ButtonBuilder().setCustomId(`card3`).setLabel(`3`).setStyle(1)
        );

        var msg = await interaction.editReply({
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
        case "card1":
          selectedCard = cards[0];
          break;
        case "card2":
          selectedCard = cards[1];
          break;
        case "card3":
          selectedCard = cards[2];
          break;
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const nextIssueNumber = await getNextIssueNumber(selectedCard.name);

        const newCard = new Card({
          name: selectedCard.name,
          group: selectedCard.group,
          rarity: selectedCard.value,
          act: selectedCard.act,
          owner: interaction.user.id,
          date: new Date().toISOString(),
          issue: nextIssueNumber,
          code: `${selectedCard.code}#${nextIssueNumber}`, 
          image: selectedCard.image,
          star: selectedCard.star,
          logo: selectedCard.logo
        });

        await newCard.save({ session });
        await session.commitTransaction();

        await i.update({
          embeds: [
            new EmbedBuilder()
              .setColor(client.bot.color)
              .setAuthor({ name: `${player.tag} || Drop Claimed`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
              .setDescription(`<@${interaction.user.id}> has claimed \`${selectedCard.code}#${nextIssueNumber}\` **${selectedCard.group}** __${selectedCard.name}__ ${getRarity(selectedCard.value)}`)
              .setImage(selectedCard.image)
          ],
          components: [],
          files: []
        });
      } catch (error) {
        await session.abortTransaction();
        console.error(error);
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