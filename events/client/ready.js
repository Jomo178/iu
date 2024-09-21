const Bot = require("../../models/bot.js");
const Discord = require("discord.js");

module.exports = async client => { 
    console.log(`${client.user.tag} is online in ${client.guilds.cache.size} servers`);

    let botSettings = await Bot.findOne({ id: client.user.id });
    if (!botSettings) botSettings = await client.create.bot(client.user.id);

    setInterval(async function () {
        if (client.ws.status === Discord.Status.Ready) { 
            try {
                client.user.setPresence({
                    status: 'online',
                    activities: [{
                        name: botSettings.status,
                        type: Discord.ActivityType.Custom,
                        state: botSettings.status
                    }]
                });
            } catch (error) {
                console.error('Failed to set presence:', error);
            }
        } else {
            console.warn('Bot is not connected, skipping setPresence');
        }
    }, 60000000);  

    client.bot = botSettings;
};
