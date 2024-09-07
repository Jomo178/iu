const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const config = require("./config.json");

mongoose.connect(config.database, {
    dbName: "IU",
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction],
    rest: { timeout: 50000 }
});

client.setMaxListeners(20);


client.config = config;
client.devs = config.devs;
client.create = require("./functions/create.js");
client.cd = require("./functions/cooldown.js");

client.cooldowns = new Map();
client.devs = config.devs;
client.categories = fs.readdirSync("./slscommands/");
client.snipes = new Collection();
client.context = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

["event", "slash"].forEach((handler) => {
    require(`./handler/${handler}`)(client);
});


Date.prototype.getUnixTime = function () {
    return (this.getTime() / 1000) | 0;
};
if (!Date.now)
    Date.now = function () {
        return new Date();
    };
Date.time = function () {
    return Date.now().getUnixTime();
};

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
}

client.login(config.token).catch(console.error);


module.exports = client;