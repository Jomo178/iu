const { CommandInteraction, Client, EmbedBuilder } = require("discord.js");
const userBase = require("../../models/user.js");
const Font = require("../../models/fonts.js");

module.exports = {
    name: 'inventory-fonts',
    category: 'fonts',
    description: 'Show your font inventory',
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        const user = await userBase.findOne({ user: interaction.user.id });
        if (!user) return await interaction.editReply({ content: 'User not found.', ephemeral: true });

        if (!user.fonts || user.fonts.length === 0) {
            return await interaction.editReply({ content: 'You have no fonts in your inventory.', ephemeral: true });
        }

        const fontMap = new Map();
        for (const f of user.fonts) {
            if (fontMap.has(f.name)) {
                const existing = fontMap.get(f.name);
                existing.total += f.total;
                existing.used += f.used;
            } else {
                fontMap.set(f.name, { total: f.total, used: f.used });
            }
        }

        let fontDescriptions = Array.from(fontMap.entries()).map(([name, { total, used }]) => {
            return `• **${name}**: ${total} available | ${used} used`;
        }).join('\n');

        let embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: `Font Inventory`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(fontDescriptions || 'No fonts found in inventory.')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
