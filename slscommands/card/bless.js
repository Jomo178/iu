const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require("../../models/user.js");
module.exports = {
    name: 'bless',
    category: 'economy',
    description: 'Bless yourself and another user with balance every hour',
    options: [
        { name: 'user', type: 6, description: 'The user to bless', required: true }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {


        const user = interaction.user;
        const mentioned = interaction.options.getUser('user');
        const amount = Math.floor(Math.random() * 40) + 1


        if (mentioned.id === user.id) {
            return await interaction.followUp({ content: '`❌` You cannot bless yourself.', ephemeral: true });
        }


        const firstUser = await userBase.findOne({ user: user.id });
        const mentionedUser = await userBase.findOne({ user: mentioned.id });

        if (!mentionedUser) {
            return await interaction.followUp({ content: '\`❌\` User mentioned not found.', ephemeral: true });
        }


        firstUser.balance += amount;
        mentionedUser.balance += amount;

        await firstUser.save();
        await mentionedUser.save();


        const embed = new EmbedBuilder()
        .setAuthor({ name: user.tag || 'Bless', iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`You blessed ${mentioned} and yourself with ${amount} balance.`)
        .setColor('#303135') 
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));
      
                
      await interaction.followUp({ embeds: [embed] })

  }
}