const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, InteractionCollector } = require("discord.js");
const issueBase = require("../../models/issue.js");

module.exports = {
    name: 'issuecard',
    category: 'dev',
    description: 'Add a new card issue to the database',
    options: [],
    deferBypass: true,  
    run: async (client, interaction, args) => {
        let issueCardModal = new ModalBuilder()
            .setCustomId('issuecard_modal')
            .setTitle('Issue a New Card');

        let nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Name of the person')
            .setStyle(1)
            .setRequired(true);

        let groupInput = new TextInputBuilder()
            .setCustomId('group')
            .setLabel('Group of the idol')
            .setStyle(1)
            .setRequired(true);

        let rarityInput = new TextInputBuilder()
            .setCustomId('rarity')
            .setLabel('Rarity of the card')
            .setStyle(1)
            .setRequired(true);

        let actInput = new TextInputBuilder()
            .setCustomId('act')
            .setLabel('Act of the idol')
            .setStyle(1)
            .setRequired(true);

        let imageInput = new TextInputBuilder()
            .setCustomId('image')
            .setLabel('URL for the card')
            .setStyle(1)
            .setRequired(true);

        issueCardModal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(groupInput),
            new ActionRowBuilder().addComponents(rarityInput),
            new ActionRowBuilder().addComponents(actInput),
            new ActionRowBuilder().addComponents(imageInput)
        );

        await interaction.showModal(issueCardModal);

        const filter = (i) => i.customId === 'issuecard_modal' && i.user.id === interaction.user.id;
        const collector = new InteractionCollector(client, { filter, time: 120000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'issuecard_modal') {
                const name = i.fields.getTextInputValue('name');
                const group = i.fields.getTextInputValue('group');
                const rarity = i.fields.getTextInputValue('rarity');
                const act = i.fields.getTextInputValue('act');
                const image = i.fields.getTextInputValue('image');
                const code = generateCardCode(name, group, rarity, interaction.user.username);

                const newIssue = new issueBase({
                    name,
                    group,
                    rarity,
                    act,
                    code,
                    image
                });
                await newIssue.save();

                const embed = new EmbedBuilder()
                    .setTitle('New Card Issue Added')
                    .setDescription(`
                        **Name:** ${name}
                        **Group:** ${group}
                        **Rarity:** ${rarity}
                        **Act:** ${act}
                        **Code:** ${code}
                    `)
                    .setThumbnail(image)
                    .setColor('#303135');

                await i.reply({ embeds: [embed] });

                const channel = client.channels.cache.get('1270037664724291584');
                if (channel) {
                    await channel.send({ embeds: [embed] });
                } else {
                    console.error('Channel not found');
                }
            }
        });
    }
};

function generateCardCode(name, group, rarity, username) {
    const firstLetter = name.charAt(0).toUpperCase();
    const lastLetter = name.charAt(name.length - 1).toUpperCase();
    const firstTwoGroupChars = group.substring(0, 2).toUpperCase();
    const userFirstLetter = username.charAt(0).toUpperCase();
    const rarityCode = rarity.toUpperCase();

    return `${firstLetter}${lastLetter}${firstTwoGroupChars}${userFirstLetter}${rarityCode}`;
}
