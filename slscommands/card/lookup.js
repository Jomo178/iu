const { EmbedBuilder } = require("discord.js");
const cardBase = require("../../models/card.js");
const getRarity = require("../../functions/getRarity.js");

module.exports = {
  name: "lookup",
  category: "card",
  description: "Lookup for any card from the Uaenaverse",
    options: [
        { name: 'code', type: 3, description: 'Card code you want to search up', required: true }
    ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    const user = interaction.user;
    const cardCode = interaction.options.getString("code");
    const lookup = await cardBase.findOne({ code: cardCode });

    if (!lookup) {
      return await interaction.followUp({
        content: "`❌` This card does not exist in the database.",
        ephemeral: true,
      });
    }

    const cardName = lookup.name 
    const cardAct = lookup.act
    const cardRarity = lookup.rarity
    const cardOwner = lookup.owner

    let createdDate = new Date(lookup.date);
    let createdTimestamp = "N/A";
    if (!isNaN(createdDate.getTime())) {
      createdTimestamp = Math.floor(createdDate.getTime() / 1000);
    }

    const description = [
      `**Name:** ${cardName}`,
      `**Act:** ${cardAct}`,
      `**Rarity:** ${getRarity(cardRarity)}`,
      `**Owner:** <@${cardOwner}>`,
      `**Issued:** ${
        createdTimestamp === "N/A" ? "N/A" : `<t:${createdTimestamp}:F>`
      }`,
    ].join("\n");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: user.tag || "Lookup",
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `${user} searched for \n\`\`\`${cardCode}\`\`\`\n${description}`
      )
      .setThumbnail(lookup.image || "https://example.com/default-thumbnail.png")
      .setColor("#303135");

    await interaction.followUp({ embeds: [embed] });
  },
};
