const { Client, EmbedBuilder, CommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: "help",
    category: "info",
    deferBypass: true,  
    description: "Displays a menu of all commands or details for a specific command",
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const commandDescriptions = {
            'Drop': 'Drops 3 cards choose one.',
            'Cooldown': 'Check your commands cooldown.',
            'Gift': 'Gift a card to another user.',
            'Inventory-card': 'Displays your card inventory.',
            'Lookup': 'Looks up details of a specific card.',
            'Bless': 'Blesses your economy balance (and someone else too 🥰).',
            'Daily': 'Collect your daily reward.',
            'Give': 'Give some of your balance to another user.',
            'Work': 'Earn koins by working.',
            'Balance': 'Shows your current balance.',
            'Profile': 'Shows your profile details.',
            'Looking-for': 'Displays what you are looking for.',
            'Bio': 'Edit your bio information.',
            'Favorite': 'Edit your favorite items or cards.'
        };

        const createHelpEmbed = () => new EmbedBuilder()
            .setColor('#739072') 
            .setTitle('Help Menu')
            .setDescription('Select a command to get more details:\nCard Commands: \`\`\`drop, cooldown, gift, inventory, lookup\`\`\`\nEconomy Commands: \`\`\`bless, daily, give, work, balance\`\`\`\nProfile Commands: \`\`\`profile, looking-for, bio, favorite\`\`\` ')
            .setFooter({ text: 'Select a command from the dropdown menu for more info.' });

        const createSelectMenu = () => new StringSelectMenuBuilder()
            .setCustomId('command_select')
            .setPlaceholder('Select a command')
            .addOptions(Object.keys(commandDescriptions).map(cmd => ({
                label: cmd,
                value: cmd,
                description: commandDescriptions[cmd]
            })));

        const createActionRow = (selectMenu) => new ActionRowBuilder().addComponents(selectMenu);


        let helpMessage = await interaction.reply({ embeds: [createHelpEmbed()], components: [createActionRow(createSelectMenu())], fetchReply: true });

        const filter = i => i.customId === 'command_select' && i.user.id === interaction.user.id;
        const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 }); 

        collector.on('collect', async (i) => {
            const selectedCommand = i.values[0];

            if (commandDescriptions[selectedCommand]) {
                const commandEmbed = new EmbedBuilder()
                    .setColor('#0099ff') 
                    .setTitle(`Command: ${selectedCommand}`)
                    .setDescription(commandDescriptions[selectedCommand])
                    .setFooter({ text: 'Use the dropdown menu to select another command.' });

                await i.update({ embeds: [commandEmbed], components: [createActionRow(createSelectMenu())] });
            } else {
                await i.update({ content: 'Invalid command selected.', components: [createActionRow(createSelectMenu())] });
            }
        });

        collector.on('end', async () => {
            await helpMessage.edit({ components: [] });
        });
    }
};
