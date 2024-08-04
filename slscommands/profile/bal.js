const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require("../../models/user.js");

module.exports = {
    name:  'balance',
    category: 'user',
    description: 'Check the balance of a user',
    options: [
        { type: 6, name: "user", description: "Target @member" }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {


        const user = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
        const player = await userBase.findOne({ user: user.id })

        if (!player) {
            return await interaction.followUp({ content: '\`❌\` Mentioned user not found.', ephemeral: true });
        }
        

        const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag || `Balance` , iconURL: interaction.user.displayAvatarURL({ dynamic: true })})
            .setTitle(`${user.tag}'s Balance `)
            .setDescription(`\`🪙\` Balance: ${player.balance}\n\`🍓\` Aena: ${player.aena} `)
            .setColor('#303135') 
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })) 
      
        
  
      await interaction.followUp({ embeds: [embed] })

  }
}