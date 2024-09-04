const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require("../../models/user.js");
const verifyCD = require("../../functions/verifyCooldown.js");
module.exports = {
    name: 'bless',
    category: 'economy',
    description: 'Bless yourself and another user with koins every hour',
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
            return await interaction.editReply({ content: '`❌` You cannot bless yourself.', ephemeral: true });
        }


        const firstUser = await userBase.findOne({ user: user.id });
        const mentionedUser = await userBase.findOne({ user: mentioned.id });

        if (!mentionedUser) {
            return await interaction.editReply({ content: '\`❌\` User mentioned not found.', ephemeral: true });
        }

        let verify = await verifyCD(client, interaction, "bless", 2700000); 
        if (verify) return;

        firstUser.balance += amount;
        mentionedUser.balance += amount;

        await firstUser.save();
        await mentionedUser.save();


        const embed = new EmbedBuilder()
        .setAuthor({ name: user.tag || 'Bless', iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`You blessed ${mentioned} and yourself with ${amount} koins.`)
        .setColor('#E493B3') 
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));
      
                
      await interaction.editReply({ embeds: [embed] })

  }
}