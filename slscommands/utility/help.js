const { Client, EmbedBuilder, CommandInteraction, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: "help",
    category: "info",
    deferBypass: true,
    description: "Displays a menu of all commands or details for a specific command",
    options: [
        {
            name: 'command',
            type: ApplicationCommandOptionType.String,
            description: 'The command to get details about',
            required: false,
            choices: [
                { name: 'Drop', value: 'Drop' },
                { name: 'Cooldown', value: 'Cooldown' },
                { name: 'Gift', value: 'Gift' },
                { name: 'Inventory-card', value: 'Inventory-card' },
                { name: 'Lookup', value: 'Lookup' },
                { name: 'Bless', value: 'Bless' },
                { name: 'Daily', value: 'Daily' },
                { name: 'Hunt', value: 'Hunt' },
                { name: 'Give', value: 'Give' },
                { name: 'Work', value: 'Work' },
                { name: 'Balance', value: 'Balance' },
                { name: 'Profile', value: 'Profile' },
                { name: 'Looking-for', value: 'Looking-for' },
                { name: 'Bio', value: 'Bio' },
                { name: 'Favorite', value: 'Favorite' },
                { name: 'Inventory-Font', value: 'Inventory-Font' },
                { name: 'Apply-Font', value: 'Apply-Font' },
                { name: 'Remove-Font', value: 'Remove-Font' }
            ]
        }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const commandDescriptions = {
            'Drop': 'Drops a set of 3 cards & you can claim one.',
            'Cooldown': 'Check your commands cooldown.',
            'Gift': 'Gift a card to another user.',
            'Inventory-card': 'Displays your card inventory.',
            'Lookup': 'Looks up details of a specific card.',
            'Bless': 'Blesses your economy balance (and someone else too 🥰).',
            'Daily': 'Collect your daily reward.',
            'Hunt': 'Drops a set of 2 random cards with 50% chance of getting it (or it runs away 🏃‍♂️).',
            'Give': 'Give some of your balance to another user.',
            'Work': 'Earn koins by working.',
            'Balance': 'Shows your current balance.',
            'Profile': 'Shows your profile details.',
            'Looking-for': 'Displays what you are looking for.',
            'Bio': 'Edit your bio information.',
            'Favorite': 'Edit your favorite items or cards.',
            'Inventory-Font': 'Displays your font inventory.',
            'Apply-Font': 'Apply a font you have on a card.',
            'Remove-Font': 'Remove a font from a card (sets to default).'
        };

        const createHelpEmbed = () => new EmbedBuilder()
            .setColor('#739072')
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTitle('Help Menu')
            .setDescription(
                'Here are the available commands:\n\n' +
                '**Card Commands:**\n```drop, cooldown, gift, inventory, lookup, hunt```\n' +
                '**Economy Commands:**\n```bless, daily, give, work, balance```\n' +
                '**Profile Commands:**\n```profile, looking-for, bio, favorite```\n' +
                '**Font Commands:**\n```inventory-font, apply-font, remove-font```'
            )
            .setFooter({ text: 'Use `/help [command]` to get more details about a specific command.' });

        const command = interaction.options.getString('command');

        if (command && commandDescriptions[command]) {
            const commandEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Command: ${command}`)
                .setDescription(commandDescriptions[command])
                .setFooter({ text: 'Use `/help [command]` to select another command.' });

            await interaction.reply({ embeds: [commandEmbed] });
        } else {
            await interaction.reply({ embeds: [createHelpEmbed()] });
        }
    }
};
