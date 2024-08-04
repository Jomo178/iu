const Bot = require("../../models/bot.js");
const Discord = require("discord.js")
module.exports = async client => { 
    console.log(`${client.user.tag} is online in ${client.guilds.cache.size} servers`)

    let botSettings = await Bot.findOne({ id: client.user.id })
    if (!botSettings) botSettings = await client.create.bot(client.user.id);

    setInterval(async function () {
        client.user.setPresence({
            status: `online/dnd/idle`,
            activities: [{
                name: botSettings.status,
                type: Discord.ActivityType.Custom,
                state: botSettings.status
            }]
        });
    })
    client.bot = botSettings;
    client.user.setPresence({
        status: `online/dnd/idle`,
        activities: [{
            name: botSettings.status,
            type: Discord.ActivityType.Custom,
            state: botSettings.status
        }]
    });
}