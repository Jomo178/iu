const { CommandInteraction, Client, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const mongoose = require('mongoose');
const Users = require("../../models/user.js");
const verifyCD = require("../../functions/verifyCooldown.js");
const Card = require("../../models/card.js");
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
    // if (interaction.user.id !== "398314054147637248") {
    //   let g = client.guilds.cache.get("967412084746883072")
    //   let mem = g.members.cache.get(interaction.user.id);
    //   var verify;
    //   if (!mem || !mem.premiumSince) {
    //     verify = await verifyCD(client, interaction, "drop", 420000);
    //   } else {
    //     verify = await verifyCD(client, interaction, "drop", 180000);
    //   }
    //   if (verify) return;
    // }

    let user = await Users.findOne({ userID: interaction.user.id });
    if (!user) user = await client.create.user(interaction.user.id);

    // Draw 3 random cards
    let cards = await drawRandomCards(3);

    let embeds = cards.map((card, index) => (
      new EmbedBuilder()
        .setColor(client.bot.color)
        .setAuthor({ name: `${interaction.user.tag} — drop`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setTitle(`Card ${index + 1}`)
        .setDescription(`**Name:** ${card.name}\n**Rarity:** ${card.value}`)
        .setImage(card.image)
    ));

    let buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('select_card_1')
          .setLabel('1')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('select_card_2')
          .setLabel('2')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('select_card_3')
          .setLabel('3')
          .setStyle(ButtonStyle.Primary)
      );

    // await interaction.deferReply();
    let msg = await interaction.editReply({ embeds: embeds, components: [buttons] });

    const filter = i => i.user.id === interaction.user.id && i.message.id === msg.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

    collector.on('collect', async i => {
      collector.stop();

      let selectedCardIndex;
      switch (i.customId) {
        case 'select_card_1':
          selectedCardIndex = 0;
          break;
        case 'select_card_2':
          selectedCardIndex = 1;
          break;
        case 'select_card_3':
          selectedCardIndex = 2;
          break;
      }
      let selectedCard = cards[selectedCardIndex];

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Get the next issue number for the selected card
        const nextIssueNumber = await getNextIssueNumber(selectedCard.name);

        // Create a new card with the owner ID
        const newCard = new Card({
          owner: interaction.user.id,
          name: selectedCard.name,
          rarity: selectedCard.value,
          issue: nextIssueNumber,
          image: selectedCard.image
        });

        await newCard.save({ session });
        await session.commitTransaction();

        await i.update({
          embeds: [
            new EmbedBuilder()
              .setColor(client.bot.color)
              .setAuthor({ name: "Dropped Card", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
              .setDescription(`**Name:** ${selectedCard.name}\n**Issue Number:** ${nextIssueNumber}\n**Rarity:** ${selectedCard.value}`)
              .setImage(selectedCard.image)
          ],
          components: []
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