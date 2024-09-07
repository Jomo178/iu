const { CommandInteraction, Client, EmbedBuilder } = require("discord.js");
const userBase = require("../../models/user.js");
const cardModel = require("../../models/card.js");

module.exports = {
    name: 'remove-font',
    category: 'fonts',
    description: 'Remove a font from a card',
    options: [
        { name: 'code', type: 3, description: 'Code of card you would like to remove the font from', required: true }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const cardCode = interaction.options.getString('code');

        const user = await userBase.findOne({ user: interaction.user.id });
        if (!user) return await interaction.editReply({ content: 'User not found.', ephemeral: true });

        const card = await cardModel.findOne({ code: cardCode, owner: interaction.user.id });
        if (!card) {
            console.log('Card not found:', cardCode);
            return await interaction.editReply({ content: 'Card not found.', ephemeral: true });
        }

        if (card.font === 'Fjalla One') {
            return await interaction.editReply({ content: 'The card already uses the default font.', ephemeral: true });
        }

        const fontName = card.font;
        const font = user.fonts.find(f => f.name === fontName);
        if (font) {
            font.used -= 1;
            await user.save();
        }

        card.font = 'Fjalla One';
        await card.save();

        await interaction.editReply({ content: `Font **${fontName}** has been removed and set to the default font.`, ephemeral: true });
    }
};
