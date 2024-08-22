const {
  CommandInteraction,
  Client,
  EmbedBuilder,
} = require("discord.js");
const Users = require("../../models/user.js");
const moment = require("moment");
const verifyCD = require("../../functions/verifyCooldown.js");

module.exports = {
  name: "daily",
  category: "economy",
  description: "Claim your daily",
  permissions: [""],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    let verify = await verifyCD(client, interaction, "daily", 86400000);
    if (verify) return;
    
    let money = 100;

    let user = await Users.findOne({ user: interaction.user.id });
    if (!user) user = await client.create.user(interaction.user.id);

    if (!user.streak) user.streak = 0;
    if (!user.streakTime) user.streakTime = null;

    let streak = await getStreak(user);

    money = streak.newStreak >= 10 ? 1000 : money * streak.newStreak;

    console.log(user.balance, money);
    user.balance += money;
    await user.save();

    let text = `${
      streak.lostStreak
        ? `You lost your streak of \`${streak.oldStreak}\` days!`
        : ""
    }\n${`You are now on a streak of \`${streak.newStreak}\` days!`}`;
    
    let embed = new EmbedBuilder()
      .setColor(client.bot.color)
      .setAuthor({
        name: `Daily`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `You have received your daily \`${money}\` <:lapiscoin:994083759999701052>\n${text}`
      )
      .setTimestamp();

    interaction.editReply({ embeds: [embed] });

    async function getStreak(user) {
      let oldStreak = user.streak;
      let lost = false;
      if (user.streakTime) {
        let now = new Date();
        let streakTime = new Date(user.streakTime);

        let hours = (now - streakTime) / (1000 * 60 * 60);

        if (hours > 48) {
          user.streak = 0;
          lost = true;
        }
      }

      user.streak += 1;
      user.streakTime = new Date(); // Set to the current date and time

      return {
        oldStreak,
        newStreak: user.streak,
        lostStreak: lost,
      };
    }
  },
};
