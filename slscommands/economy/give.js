const { EmbedBuilder, AttachmentBuilder, ButtonBuilder, ActionRowBuilder, TextInputBuilder, InteractionCollector, ModalBuilder } = require("discord.js");
const userBase = require('../../models/user.js');

module.exports = {
    name: 'give',
    category: 'economy',
    description: 'Transfer balance or aena to another user',
    options: [
        { name: 'user', type: 6, description: 'The user to give currency to', required: true },
        { name: 'currency', type: 3, description: 'The type of currency to give (balance or aena)', choices: [{ name: 'Balance', value: 'balance' }, { name: 'Aena', value: 'aena' }], required: true },
        { name: 'amount', type: 10, description: 'The amount of currency to give (must be a whole number)', required: true }
    ],
    run: async (client, interaction) => {

        const currency = interaction.options.getString('currency');
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getNumber('amount');

        if (amount <= 0 || !Number.isInteger(amount)) {
            return await interaction.followUp({ content: ' \`❌\` The amount is not a positive & non decimal integer.', ephemeral: true });
        }

            const giverData = await userBase.findOne({ user: interaction.user.id });
            const receiverData = await userBase.findOne({ user: targetUser.id });

            if (!receiverData) {
                return await interaction.followUp({ content: '\`❌\` User mentioned not found.', ephemeral: true });
            }

            if (giverData[currency] < amount) {
                return await interaction.followUp({ content: '\`❌\` Insufficient balance.', ephemeral: true });
            }

            giverData[currency] -= amount;
            receiverData[currency] += amount;

            await giverData.save();
            await receiverData.save();

            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag || 'Transaction', iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`Successfully transferred ${amount} ${currency} to ${targetUser}`)
                .setColor('#303135')
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

            await interaction.followUp({ embeds: [embed] });
        } 
    }
