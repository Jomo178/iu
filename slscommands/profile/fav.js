const { Client, CommandInteraction, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require("../../models/user.js");
const cardBase = require("../../models/card.js");

module.exports = {
    name: 'favorite',
    category: 'profile',
    description: 'Choose your favorite card',
    deferBypass: true,
    options: [
        { name: 'code', type: 3, description: 'Card code you want to favorite', required: true }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const cardCode = interaction.options.getString('code');
        const card = await cardBase.findOne({ code: cardCode });

        if (!card) {
            return await interaction.reply({ content: `❌ \`${cardCode}\` does not exist.`, ephemeral: true });
        }

        if (card.owner !== interaction.user.id) {
            return await interaction.reply({ content: `❌ \`${cardCode}\` does not belong to you! Try again with a card you own.`, ephemeral: true });
        }

        await userBase.findOneAndUpdate(
            { user: interaction.user.id },
            { favCard: cardCode, favCardImage: card.image }
        );

        await interaction.reply({ content: `✅ Your favorite card has now been set to \`${cardCode}\`.` });
    }
}
