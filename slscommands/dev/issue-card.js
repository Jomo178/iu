const { EmbedBuilder } = require("discord.js");
const issueBase = require("../../models/issue.js");

module.exports = {
    name: 'issuecard',
    description: 'Add a new card issue to the database',
    options: [
        { name: 'name', type: 3, description: 'Name of the person', required: true },
        { name: 'group', type: 3, description: 'Group of the idol', required: true },
        { name: 'rarity', type: 3, description: 'Rarity of the card', required: true },
        { name: 'act', type: 3, description: 'Act of the idol', required: true },
        { name: 'code', type: 3, description: 'Basic code', required: true },
        { name: 'image', type: 3, description: 'URL for the card', required: true }
    ],
    run: async (client, interaction) => {
        const name = interaction.options.getString('name');
        const group = interaction.options.getString('group');
        const rarity = interaction.options.getString('rarity');
        const act = interaction.options.getString('act');
        const code = interaction.options.getString('code');
        const image = interaction.options.getString('image');

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


        await interaction.followUp({ embeds: [embed] });
    }
}