const {
  CommandInteraction,
  Client,
  EmbedBuilder,
} = require("discord.js");
const Users = require("../../models/user.js");
const Font = require("../../models/fonts.js");
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
    let money = 100;

    let user = await Users.findOne({ user: interaction.user.id });
    if (!user) user = await client.create.user(interaction.user.id);

    if (!user.streak) user.streak = 0;
    if (!user.streakTime) user.streakTime = null;

    let streak = await getStreak(user);

    money = streak.newStreak >= 10 ? 1000 : money * streak.newStreak;

    console.log(user.balance, money);
    user.balance += money;

    // Determine if the user should receive a new font
    let fontReward = null;
    if (streak.newStreak % 3 === 0) {
      fontReward = await giveRandomFont(user);
    }

    await user.save();

    let text = `${
      streak.lostStreak
        ? `You lost your streak of \`${streak.oldStreak}\` days!`
        : ""
    }\n${`You are now on a streak of \`${streak.newStreak}\` days!`}`;

    if (fontReward) {
      text += `\nYou have also received a new random font: \`${fontReward.name}\`!`;
    } else {
      text += `\nNo new font was awarded today.`;
    }

    let embed = new EmbedBuilder()
      .setColor(`#FFCF81`)
      .setAuthor({ name: `Daily`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(
        `You have received your daily \`${money}\` <:koins:1275788858851721267>\n${text}`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

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
      user.streakTime = new Date();

      return {
        oldStreak,
        newStreak: user.streak,
        lostStreak: lost,
      };
    }

    async function giveRandomFont(user) {
      const fonts = await Font.find({ onMarket: false });
      if (fonts.length === 0) {
        console.log('No fonts available.');
        return null;
      }

      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
      console.log('Random font selected:', randomFont);

      if (!user.fonts) user.fonts = [];

      const existingFont = user.fonts.find(f => f.name === randomFont.name);
      
      if (existingFont) {
        existingFont.total += 1;
      } else {
        user.fonts.push({
          name: randomFont.name,
          total: 1,
          used: 0
        });
      }

      console.log('Font updated in user inventory:', randomFont.name);
      return randomFont;
    }
  },
};
