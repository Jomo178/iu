const { CommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'cooldown',
  category: 'card',
  description: 'View your commands cooldowns',
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  async run(client, interaction) {
    try {
      const getCooldownStatus = async (userId, commandName) => {
        const cd = await client.cd.checkCoolDown(userId, commandName);
        return cd.ready
          ? "`🟢` Ready"
          : `\`🔴\` <t:${cd.unixTime}:R> (<t:${cd.unixTime}:t>)`;
      };

      const userId = interaction.user.id;

      const embed = new EmbedBuilder()
        .setColor(`#2b2d31`)
        .setAuthor({ name: interaction.user.tag || 'Cooldowns', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setAuthor({
          name: `${interaction.user.username}'s Cooldowns`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      const fields = [
        { name: "Daily", value: await getCooldownStatus(userId, "daily") },
        { name: "Hunt", value: await getCooldownStatus(userId, "hunt") },
        { name: "Drop", value: await getCooldownStatus(userId, "drop") },
        { name: "Bless", value: await getCooldownStatus(userId, "bless") },
        { name: "Work", value: await getCooldownStatus(userId, "work") },
      ];

      embed.addFields(fields);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error handling cooldown command:', error);
      await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
    }
  }
};
