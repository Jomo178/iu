const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const os = require('os'); // For system information like RAM usage

module.exports = {
    name: 'botinfo',
    description: 'Displays detailed information about the bot, including statistics and system info.',
    run: async (client, interaction, args) => {


        const developer = 'jisachao, shadmehr._.7, _charlee_ ';
        const jsVersion = '20.15.1'; // Replace with Node.js version if using JavaScript
        const libraryVersion = 'discord.js v14'; // Replace if using a different library
        const shardId = client.shard ? client.shard.ids[0] : 'N/A'; // Current shard ID
        const totalShards = client.shard ? client.shard.count : 1; // Total shards
        const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // RAM usage in MB

        // Uptime calculation
        const uptime = client.uptime / 1000;
        const uptimeDays = Math.floor(uptime / 86400);
        const uptimeHours = Math.floor((uptime % 86400) / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);

        // Fetch server and user count
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.users.cache.size;

        // Create the embed with detailed information
        const botInfoEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('Bot Information')
            .setDescription('Here is some information about the bot and its current status.')
            .addFields(
                { name: 'Developer', value: developer, inline: false },
                { name: 'Library', value: libraryVersion, inline: false },
                { name: 'Node.js Version', value: jsVersion, inline: false },
                { name: 'Uptime', value: `${uptimeDays} days, ${uptimeHours} hours, ${uptimeMinutes} minutes, and ${uptimeSeconds} seconds`, inline: false },
                { name: 'Total Servers', value: `${totalGuilds}`, inline: false },
                { name: 'Total Users', value: `${totalUsers}`, inline: false },
                { name: 'Shard', value: `${shardId}/${totalShards}`, inline: false },
                { name: 'Latency', value: `${client.ws.ping.toFixed(2)} ms`, inline: false }
            )
            .setFooter({ text: 'Thank you for using our bot!' })
            .setTimestamp();

        // Create buttons for Support Server, Invite, and Vote
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL('https://discord.gg/delufe') // Replace with your support server link
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Invite')
                    .setURL('https://discord.com/oauth2/authorize?client_id=831437987145318412&scope=bot&permissions=534723820608') // Replace with your bot invite link
                    .setStyle(ButtonStyle.Link)
            );

        // Reply with the embed and the buttons
        await interaction.editReply({ embeds: [botInfoEmbed], components: [row] });
    }
};
