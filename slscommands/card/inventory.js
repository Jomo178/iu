const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const cardBase = require("../../models/card.js");
const getRarity = require("../../functions/getRarity.js");

module.exports = {
  name: "inventory",
  description: "View the cards in your inventory",
  options: [
    {
      name: "user",
      type: 6, 
      description: "User to view the inventory of (leave blank for yourself)",
      required: false,
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const player = interaction.options.getUser("user") || interaction.user;

    if (!player) {
        return await interaction.followUp({ content: '\`❌\` Mentioned user not found.', ephemeral: true });
    }

    let allCards = await cardBase.find({ owner: player.id }).sort({ date: -1 }).exec();

    if (allCards.length === 0) {
      return interaction.followUp({
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
        .setColor("#2f3136")
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
    const message = await interaction.followUp({ embeds: [initialEmbed], components: components() });

    const collector = message.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== player.id) {
        return i.reply({ content: "You can't control this inventory.", ephemeral: true });
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
