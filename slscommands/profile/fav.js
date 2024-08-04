const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require("../../models/user.js");

module.exports = {
    name: 'favorite',
    category: 'user',
    description: 'Choose your favorite card',
    options: [
        { type: 3, name: "favorite", description: "Enter the card code you would like to favorite", required: true  }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {

        const user = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
        const cardCode = interaction.options.getString('cardcode');
        const card = await cardBase.findOne({ code: cardcode, user: user.id });

        if (!card) {
            return await interaction.followUp({ content: '\`❌\` \`${cardCode}\` does not exist.', ephemeral: true });
        }

        if (!card || card.owner !== user.id) {
            return await interaction.followUp({ content: '\`❌\` \`${cardCode}\` does not belong to you! Try again with a card you own.', ephemeral: true });
        }

        await userBase.findOneAndUpdate({ user: user.id }, { favCard: cardCode, favCardImage: card.image },
        );

        await interaction.followUp({ content: "\`✅\` Your favorite card has now been set to \`${cardCode}\`"});
    }
}
