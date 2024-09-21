const { Client, GatewayIntentBits, Partials, Collection, WebSocketShard } = require("discord.js");
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

// Increase maximum listeners for client and WebSocketShard
client.setMaxListeners(30);
WebSocketShard.setMaxListeners(30); // Increase if needed

client.config = config;
client.devs = config.devs;
client.create = require("./functions/create.js");
client.cd = require("./functions/cooldown.js");

client.cooldowns = new Map();
client.categories = fs.readdirSync("./slscommands/");
client.snipes = new Collection();
client.context = new Collection();
client.commands = new Collection();
client.aliases = new Collection();
client.slashCommands = new Collection();

["event", "slash"].forEach((handler) => {
    require(`./handler/${handler}`)(client);
});

client.on('shardReady', (id) => {
    console.log(`Shard ${id} is ready! WebSocket connection established.`);
});

client.on('shardDisconnect', (event, id) => {
    console.warn(`Shard ${id} disconnected. Attempting to reconnect...`);
});

client.on('shardReconnecting', (id) => {
    console.warn(`Shard ${id} is reconnecting...`);
});

client.on('shardResume', (id, replayedEvents) => {
    console.log(`Shard ${id} resumed. Replayed ${replayedEvents} events.`);
});

process.on('uncaughtException', async (error) => {
    console.error(`[CAUGHT ERROR] ${error.stack}`);
    await logErrorToChannel(error, 'uncaughtException');
});

process.on('unhandledRejection', async (error) => {
    console.error(`[CAUGHT ERROR] ${error.stack}`);
    await logErrorToChannel(error, 'unhandledRejection');
});

async function logErrorToChannel(error, type) {
    try {
        var guild = client.guilds.cache.get("1265686888782626949");
        if (!guild) return;
      
        var logs = guild.channels.cache.get('1279381025499385928');
        if (logs) {
            await logs.send({content: `[${type.toUpperCase()}] ${error.stack}`});
        }
    } catch (err) {
        console.error(`Failed to log error to channel: ${err.stack}`);
    }
}

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

function loginWithRetry(retries = 5) {
    client.login(config.token)
        .then(() => console.log('Logged in successfully!'))
        .catch(async error => {
            console.error('Error logging in:', error);
            await logErrorToChannel(error, 'loginError');
            if (retries > 0) {
                const delay = Math.pow(2, 5 - retries) * 1000;
                console.log(`Retrying login in ${delay / 1000} seconds...`);
                setTimeout(() => loginWithRetry(retries - 1), delay);
            } else {
                console.error('Max login retries reached.');
            }
        });
}

loginWithRetry();

module.exports = client;