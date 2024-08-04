const { Client, SlashCommandBuilder } = require("discord.js");
const { readdirSync } = require("fs");
const { Routes } = require("discord-api-types/v10");
const { REST } = require("@discordjs/rest");
const ascii = require("ascii-table")
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType,  } = require('discord-api-types/v10');


/**
   *
   * @param {Client} client
   */

module.exports = (client) => {
    var table1 = new ascii().setHeading("Context Command", "Load Status");
    var table2 = new ascii().setHeading("Slash Command", "Load Status");
    let arrayOfContext = [];


    const arrayOfSlashCommands = [];
    readdirSync("./slscommands").forEach(cmd => {
        var commands = readdirSync(`./slscommands/${cmd}/`).filter((file) => file.endsWith(".js"));
        for (let file of commands) {
            let pull = require(`../slscommands/${cmd}/${file}`);
            if (pull.name) {
                client.slashCommands.set(pull.name, pull);
                arrayOfSlashCommands.push(pull)
                table1.addRow(file, "✔")
            } else {
                table1.addRow(file, '❌ -> missing something??');
                continue;
            }
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));

        }
    })

    let commands = readdirSync('./context/').filter((file) => file.endsWith(".js"));

    for (let file of commands) {
        let pull = require(`../context/${file}`);

        if (pull.name) {
            client.context.set(pull.name, pull);
            table2.addRow(file, "✔")
            arrayOfContext.push(pull)
        } else {
            table2.addRow(file, '❌ -> missing something??');
            continue;
        }
    }

    const rest = new REST({ version: 9 }).setToken(client.config.token);

    client.on("ready", async () => {

        let cmds = [].concat(arrayOfSlashCommands)

        for (i = 0; i < arrayOfContext.length; i++) {
            let cmd = new ContextMenuCommandBuilder()
                .setName(arrayOfContext[i].name)
                .setType(arrayOfContext[i].type)

            cmds.push(cmd)
        }

        await rest.put(
            Routes.applicationCommands(client.user.id), { body: cmds }
        )

    })

    console.log(table1.toString())
    console.log(table2.toString())
}