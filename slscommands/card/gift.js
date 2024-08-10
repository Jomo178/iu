const { Client, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const userBase = require("../../models/user.js");
const cardModel = require("../../models/card.js");
const getRarity = require("../../functions/getRarity.js");

module.exports = {
    name: "gift",
    description: "Gift a card to another user",
    deferBypass: true,
    options: [
        {
            name: 'user',
            type: 6, 
            description: 'User to gift the card to',
            required: true
        },
        {
            name: 'cardcode',
            type: 3, 
            description: 'The code of the card you want to gift',
            required: true
        }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {

        const recipient = interaction.options.getUser('user');
        const cardCode = interaction.options.getString('cardcode');

        if (recipient.id === interaction.user.id) {
            return interaction.reply({ content: '`❌` You cannot gift a card to yourself!', ephemeral: true });
        }

        if (!cardCode) {
            return interaction.reply({ content: '`❌` Please enter a valid card code!', ephemeral: true });
        }

        const card = await cardModel.findOne({ code: cardCode, owner: interaction.user.id });

        if (!card) {
            return interaction.reply({
                content: ` \`❌\` You do not own the card with code \`${cardCode}\``, ephemeral: true });
        }

        const confirmationEmbed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag} — Confirm Gift`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Are you sure you want to gift \`${card.code}\` **${card.name}** \`${getRarity(card.rarity)}\` to <@${recipient.id}>?`)
            .setColor('#303135')
            .setFooter({
                text: 'Click a button to confirm or cancel',
                iconURL: client.user.displayAvatarURL({ dynamic: true })
            });

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_gift')
            .setLabel('✅ Confirm')
            .setStyle(ButtonStyle.Success);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_gift')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        const confirmationMessage = await interaction.reply({
            embeds: [confirmationEmbed],
            components: [actionRow],
            fetchReply: true
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm_gift') {
                await cardModel.updateOne({ code: cardCode, owner: interaction.user.id }, { owner: recipient.id });

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: `${interaction.user.tag} — Gift Sent`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                    .setTitle('Gift Card')
                    .setDescription(`You have successfully gifted \`${card.code}\` **${card.name}** \`${getRarity(card.rarity)}\` to <@${recipient.id}>.`)
                    .setImage(card.image)
                    .setColor('#303135')

                await interaction.followUp({ embeds: [successEmbed] });

                const recipientEmbed = new EmbedBuilder()
                    .setTitle(`${interaction.user.tag} Gifted You A Card!`)
                    .setDescription(`You were gifted: \`${card.code}\` **${card.name}** \`${getRarity(card.rarity)}\``)
                    .setImage(card.image)
                    .setColor('#303135')
                    .setFooter({
                        text: 'Make Sure To Thank Them For The Gift!',
                        iconURL: client.user.displayAvatarURL({ dynamic: true })
                    });

                try {
                    await recipient.send({ embeds: [recipientEmbed] });
                } catch (error) {
                    console.error(`Failed to send DM to ${recipient.tag}: ${error.message}`);
                }

            } else if (i.customId === 'cancel_gift') {
                await interaction.followUp({
                    content: 'Gift operation cancelled.',
                    ephemeral: true
                });
            }

            await confirmationMessage.edit({
                components: []
            });
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({
                    content: 'You took too long to respond. Gift operation cancelled.',
                    ephemeral: true
                });
                confirmationMessage.edit({
                    components: []
                });
            }
        });
    }
};
