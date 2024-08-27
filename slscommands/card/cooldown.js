const { CommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'cooldown',
  category: 'card',
  description: 'View your commands cooldowns',
  deferBypass: 'true',
    /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  async run(client, interaction) {
    const getCooldownStatus = async (userId, commandName) => {
      const cd = await client.cd.checkCoolDown(userId, commandName);
      return cd.ready
        ? "`🟢` Ready"
        : `\`🔴\` <t:${cd.unixTime}:R> (<t:${cd.unixTime}:t>)`;
    };

    const userId = interaction.user.id;

    const embed = new EmbedBuilder()
      .setColor(`#F8EDE3`)
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

    await interaction.reply({ embeds: [embed] });
  }
};
