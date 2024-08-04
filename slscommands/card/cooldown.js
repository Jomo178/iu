/** const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const cmdCD = require(`command-cooldown`)
const humanized = require('humanize-duration')

module.exports = {
    name: 'cooldown',
    category: 'user',
    description: 'Check your command cooldowns.',
    '/**'
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    /** 
    run: async (client, interaction, args) => {

        let drop = await cmdCD.checkCoolDown(interaction.user.id, "drop")
        let daily = await cmdCD.checkCoolDown(interaction.user.id, "daily")
        let work = await cmdCD.checkCoolDown(interaction.user.id, "work")
        let bless = await cmdCD.checkCoolDown(interaction.user.id, "bless")

        let dropcd = "🌸"
        if (!drop.res.ready) {
          const trueTime = humanized(drop.res.rem, { language: "en" }, { units: ['h', 'm', 's'], round: true });
    
          dropcd = trueTime
        } else {
          dropcd =  "\`🟢\` __Ready__"
        }
    
        let dailycd = "🦋"
        if (!daily.res.ready) {
          const trueTime = humanized(daily.res.rem, { language: "en" }, { units: ['h', 'm', 's'], round: true });
          dailycd = trueTime
        } else {
          dailycd =  "\`🟢\` __Ready__"
        }
    
        let workcd = "🍭"
        if (!work.res.ready) {
          const trueTime = humanized(work.res.rem, { language: "en" }, { units: ['h', 'm', 's'], round: true });
          workcd = trueTime
        } else {
          workcd = "\`🟢\` __Ready__"
        }
    
        let blesscd = "🎀"
        if (!bless.res.ready) {
          const trueTime = humanized(bless.res.rem, { language: "en" }, { units: ['h', 'm', 's'], round: true });
          blesscd = trueTime
        } else {
          blesscd = "\`🟢\` __Ready__"
        }

        const embed = new EmbedBuilder()
            .setColor('#303135')
            .addField('🌸 Daily', dailycd, true)
            .addField('🦋 Drop', dropcd, true)
            .addField('🍭 Work', workcd, true)
            .addField('🎀 Bless', blesscd, true)
            .setAuthor({ name: `${interaction.user.tag} — Cooldowns`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });
        
        await interaction.reply({ embeds: [embed] });

  }
}
*/