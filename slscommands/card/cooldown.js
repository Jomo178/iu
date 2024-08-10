const { CommandInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
  name: 'cooldown',
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
      .setColor(client.bot.color)
      .setTitle(`${user.tag}'s Cooldowns `)
      .setAuthor({
        name: `${interaction.user.username}'s Cooldowns`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    const fields = [
      { name: "Daily", value: await getCooldownStatus(userId, "daily") },
      { name: "Drop", value: await getCooldownStatus(userId, "drop") },
      { name: "Bless", value: await getCooldownStatus(userId, "bless") },
      { name: "Work", value: await getCooldownStatus(userId, "work") },
    ];

    embed.addFields(fields);

    await interaction.reply({ embeds: [embed] });
  }
};
