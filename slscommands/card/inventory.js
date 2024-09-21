const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const cardBase = require("../../models/card.js");
const userBase = require("../../models/user.js");
const getRarity = require("../../functions/getRarity.js");

module.exports = {
  name: "inventory-cards",
  description: "View the cards in your inventory",
  category: 'economy',
  options: [
    { type: 6, name: "user", description: "Whose inventory do you want to view?" },
    { type: 3, name: "name", description: "Filter by card name", required: false },
    { type: 3, name: "act", description: "Filter by act (era)", required: false },
    { type: 3, name: "group", description: "Filter by card group", required: false },
    { type: 4, name: "issue", description: "Filter by issue number", required: false },
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const player = interaction.options.getUser("user") || interaction.user;
    const nameFilter = interaction.options.getString("name");
    const actFilter = interaction.options.getString("act");
    const groupFilter = interaction.options.getString("group");
    const issueFilter = interaction.options.getInteger("issue");

    const userexists = await userBase.findOne({ user: player.id });

    if (!userexists) {
      return interaction.editReply({ content: '`❌` The mentioned user does not exist!', ephemeral: true });
    }

    // Building the query with optional filters
    const query = { owner: player.id };
    if (nameFilter) query.name = { $regex: new RegExp(nameFilter, "i") };
    if (actFilter) query.act = { $regex: new RegExp(actFilter, "i") };
    if (groupFilter) query.group = { $regex: new RegExp(groupFilter, "i") };
    if (issueFilter != null) query.issue = issueFilter;

    let allCards = await cardBase.find(query).sort({ date: -1 }).exec();

    if (allCards.length === 0) {
      return interaction.editReply({
        content: `${player === interaction.user ? "You haven't" : "This user hasn't"} collected any cards yet.`,
        ephemeral: true,
      });
    }

    const itemsPerPage = 10;
    let currentPage = 0;
    const totalPages = Math.ceil(allCards.length / itemsPerPage);

    const generateEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;

      const cardDetails = allCards.slice(start, end)
        .map(card => `\`${card.code}\`  •  **[${card.name}](${card.image})**  •  ${card.group}  •  ${getRarity(card.rarity)}`)
        .join("\n");

      return new EmbedBuilder()
        .setAuthor({
          name: `${player.tag} — Inventory`,
          iconURL: player.displayAvatarURL({ dynamic: true }),
        })
        .setDescription(cardDetails)
        .setColor("#2b2d31")
        .setFooter({ text: `Page ${page + 1} / ${totalPages} | Total Cards: ${allCards.length}` });
    };

    const components = () => [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("beginning")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("⏪")
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("previous")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("◀️")
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("▶️")
          .setDisabled(currentPage === totalPages - 1),
        new ButtonBuilder()
          .setCustomId("end")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("⏩")
          .setDisabled(currentPage === totalPages - 1)
      ),
    ];

    const initialEmbed = generateEmbed(currentPage);
    const message = await interaction.editReply({ embeds: [initialEmbed], components: components() });

    const collector = message.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== player.id) {
        return i.update({ content: "You can't control this inventory.", ephemeral: true });
      }

      if (i.customId === "next") {
        currentPage++;
      } else if (i.customId === "previous") {
        currentPage--;
      } else if (i.customId === "beginning") {
        currentPage = 0;
      } else if (i.customId === "end") {
        currentPage = totalPages - 1;
      }

      const newEmbed = generateEmbed(currentPage);

      await i.update({
        embeds: [newEmbed],
        components: components(),
      });
    });

    collector.on("end", () => {
      message.edit({ components: [] });
    });
  },
};
