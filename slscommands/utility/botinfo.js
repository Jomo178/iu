const { Client, EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'bot-info',
    category: 'utility',
    description: 'Information about the bot',

    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        // Get shard and total shard info
        const shard = client.shard;
        const totalShards = client.options.shards;

        try {
            // Aggregate user count from all shards
            const totalUsers = (await client.shard.broadcastEval((client) => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)))
                .reduce((acc, count) => acc + count, 0);

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
                .setColor('#F5E8DD')
                .setTitle('Bot Information')
                .setDescription('Here is detailed information about the bot and its current shard.')
                .addFields(
                    { name: 'Shard Number', value: shard.id.toString(), inline: true },
                    { name: 'Total Shards', value: totalShards.toString(), inline: true },
                    { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
                    { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
                    { name: 'Users (Total)', value: totalUsers.toString(), inline: true },
                    { name: 'Channels', value: client.channels.cache.size.toString(), inline: true },
                    { name: 'Memory Usage', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'IU Bot - Shard Info' });

            await interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching user count:', error);
            await interaction.followUp({ content: 'There was an error fetching the bot information.', ephemeral: true });
        }
    }
};
