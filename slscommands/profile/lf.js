const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require("../../models/user.js");

module.exports = {
    name: 'looking-for',
    category: 'profile',
    description: 'Enter a looking for status',
    options: [
        { type: 3, name: "lf", description: "Your looking for status", required: true  }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {

        const user = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
        const lf = interaction.options.getString("lf");

        if (lf.length > 100) {
            await interaction.editReply({ content: "\`❌\` Your looking for status must be 100 characters or less." });
            return;
        }

        await userBase.findOneAndUpdate({ user: user.id }, { lf: lf });
        await interaction.editReply({ content: "\`✅\` Your looking for status has been updated." });
    }
}