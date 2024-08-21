const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require("../../models/user.js");

module.exports = {
    name: 'bio',
    category: 'profile',
    description: 'Enter a bio',
    options: [
        { type: 3, name: "bio", description: "Your new bio", required: true  }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {

        
        const user = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
        const bio = interaction.options.getString("bio");

        if (bio.length > 150) {
            await interaction.followUp({ content: "\`❌\` Your bio must NOT be more than 150 characters.", ephemeral: true });
            return;
        }

        await userBase.findOneAndUpdate({ user: user.id }, { bio: bio });
        await interaction.followUp({ content: "\`✅\` Your bio has been updated.", ephemeral: true });
    }
}