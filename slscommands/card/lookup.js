const { EmbedBuilder } = require("discord.js");
const cardBase = require("../../models/card.js");

module.exports = {
  name: "lookup",
  category: "card",
  description: "Lookup for any card from the Uaenaverse",
  options: [
    {
      name: "code",
      type: 3,
      description: "Code of the card you would like to lookup.",
      required: true,
    },
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

    // Debugging: Check the values of lookup fields
    console.log("Lookup:", lookup.act);

    // Declare variables with default values if the fields are missing
    const cardName = lookup.name || "N/A";
    const cardAct = lookup.act || "N/A";
    const cardRarity = `\`${lookup.rarity || "N/A"}\``;
    const cardOwner = lookup.owner ? `<@${lookup.owner}>` : "N/A";

    // Ensure date is parsed correctly
    let createdDate = new Date(lookup.created);
    let createdTimestamp = "N/A";
    if (!isNaN(createdDate.getTime())) {
      createdTimestamp = Math.floor(createdDate.getTime() / 1000);
    }

    const description = [
      `**Name:** ${cardName}`,
      `**Act:** ${cardAct}`,
      `**Rarity:** ${cardRarity}`,
      `**Owner:** ${cardOwner}`,
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
        `${user} searched for \n\`\`\`${cardCode}\`\`\`\n\n${description}`
      )
      .setThumbnail(lookup.image || "https://example.com/default-thumbnail.png")
      .setColor("#303135");

    await interaction.followUp({ embeds: [embed] });
  },
};
