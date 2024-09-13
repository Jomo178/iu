const { CommandInteraction, Client, EmbedBuilder } = require("discord.js");
const userBase = require("../../models/user.js");
const cardModel = require("../../models/card.js");
const Font = require("../../models/fonts.js");

module.exports = {
    name: 'apply-font',
    category: 'fonts',
    description: 'Apply a font to a card',
    options: [
        { name: 'code', type: 3, description: 'ID of the card to apply the font to', required: true },
        { name: 'fontname', type: 3, description: 'Name of the font to apply', required: true }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const cardId = interaction.options.getString('code');
        let fontName = interaction.options.getString('fontname');

        // Capitalize the font name
        fontName = fontName
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const user = await userBase.findOne({ user: interaction.user.id });
        if (!user) return await interaction.editReply({ content: 'User not found.', ephemeral: true });

        const font = user.fonts.find(f => f.name === fontName);
        if (!font) return await interaction.editReply({ content: `You don't own the font **${fontName}**.`, ephemeral: true });

        if (font.total <= font.used) {
            return await interaction.editReply({ content: `You have used all of your **${fontName}** fonts.`, ephemeral: true });
        }

        const fontInSchema = await Font.findOne({ name: fontName });
        if (!fontInSchema) return await interaction.editReply({ content: `The font **${fontName}** does not exist.`, ephemeral: true });

        const card = await cardModel.findOne({ code: cardId, owner: interaction.user.id });
        if (!card) return await interaction.editReply({ content: 'Card not found.', ephemeral: true });

        if (card.font && user.fonts.find(f => f.name === card.font && f.used >= f.total)) {
            return await interaction.editReply({ content: `You do not have enough available fonts to apply to this card.`, ephemeral: true });
        }

        card.font = fontName;
        await card.save();

        font.used += 1;
        await user.save();

        await interaction.editReply({ content: `Font **${fontName}** has been successfully applied to your card.`, ephemeral: true });
    }
};
