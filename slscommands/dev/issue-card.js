const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionCollector, EmbedBuilder } = require('discord.js');
const issueBase = require("../../models/issue.js");

module.exports = {
    name: 'issuecard',
    category: 'dev',
    description: 'Add a new card issue to the database',
    deferBypass: true,  
    run: async (client, interaction, args) => {
        const issueCardModal = new ModalBuilder()
            .setCustomId('issuecard_modal')
            .setTitle('Issue a New Card');

        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Name of the person')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const groupInput = new TextInputBuilder()
            .setCustomId('group')
            .setLabel('Group of the idol')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const rarityInput = new TextInputBuilder()
            .setCustomId('rarity')
            .setLabel('Rarity of the card')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const actInput = new TextInputBuilder()
            .setCustomId('act')
            .setLabel('Act of the idol')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const mediaInput = new TextInputBuilder()
            .setCustomId('media')
            .setLabel('URLs for Card, Star, and Logo')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('Enter URLs in the following format:\nCard URL\nStar URL\nLogo URL');

        issueCardModal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(groupInput),
            new ActionRowBuilder().addComponents(rarityInput),
            new ActionRowBuilder().addComponents(actInput),
            new ActionRowBuilder().addComponents(mediaInput)
        );

        await interaction.showModal(issueCardModal);

        const filter = (i) => i.customId === 'issuecard_modal' && i.user.id === interaction.user.id;
        const collector = new InteractionCollector(client, { filter, time: 120000 });

        collector.on('collect', async (i) => {
            try {
                if (i.customId === 'issuecard_modal') {
                    if (!i.isModalSubmit()) return;

                    const name = i.fields.getTextInputValue('name');
                    const group = i.fields.getTextInputValue('group');
                    const rarity = i.fields.getTextInputValue('rarity');
                    const act = i.fields.getTextInputValue('act');
                    const media = i.fields.getTextInputValue('media').split('\n');

                    if (media.length !== 3) {
                        return i.reply({ content: 'Please provide exactly three URLs, separated by new lines.', ephemeral: true });
                    }

                    const image = media[0].trim();
                    const star = media[1].trim();
                    const logo = media[2].trim();

                    if (isNaN(rarity)) {
                        return i.reply({ content: 'Rarity must be a number.', ephemeral: true });
                    }

                    const code = generateCardCode(name, group, rarity, interaction.user.username);

                    const existingIssue = await issueBase.findOne({ code });
                    if (existingIssue) {
                        return i.reply({ content: `This code already exists: ${code}`, ephemeral: true });
                    }

                    const newIssue = new issueBase({
                        name,
                        group,
                        rarity,
                        act,
                        code,
                        image,
                        star,
                        logo
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

                    await i.reply({ embeds: [embed], ephemeral: true });

                    const channel = client.channels.cache.get('1270037664724291584');
                    if (channel) {
                        await channel.send({ embeds: [embed] });
                    } else {
                        console.error('Channel not found');
                    }

                    collector.stop();
                }
            } catch (error) {
                console.error('Error handling interaction:', error);
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
