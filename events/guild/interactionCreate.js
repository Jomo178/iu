const { Client, Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } = require("discord.js");
const userBase = require("../../models/user.js");
const CommandUsage = require("../../models/commandusage.js");
const Font = require("../../models/fonts.js");

module.exports = async (client, interaction) => {

    // Handle User Context Menu Command
    if (interaction.isUserContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.context.get(interaction.commandName);
        if (command) {
            return command.run(client, interaction);
        }
    }

    // Handle Slash Commands
    if (interaction.type === InteractionType.ApplicationCommand) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) {
            return interaction.editReply({ content: "An error has occurred." });
        }

        let deferred = null;
        if (!cmd.deferBypass) {
            deferred = await interaction.deferReply({ ephemeral: false }).catch(() => null);
            if (!deferred) return; // If defer fails, exit
        }

        // Command Usage Tracking
        await trackCommandUsage(interaction);

        // Guild-Specific Interaction
        if (interaction.guild.id !== '1265686888782626949') {
            return await handleGuildInteraction(interaction);
        }

        // User Info Handling
        await handleUserInfo(interaction);

        // Parse Command Arguments
        const args = parseInteractionArgs(interaction);

        // Ensure interaction.member is available
        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        // Run the Command
        cmd.run(client, interaction, args);

        // Log Command Usage
        logCommandUsage(interaction);
    }
};

// Function to track command usage
async function trackCommandUsage(interaction) {
    let commandUsage = await CommandUsage.findOne({
        user: interaction.user.id,
        server: interaction.guild.id,
        command: interaction.commandName
    });

    if (commandUsage) {
        commandUsage.usageCount += 1;
        commandUsage.date = Date.now();
    } else {
        commandUsage = new CommandUsage({
            user: interaction.user.id,
            server: interaction.guild.id,
            command: interaction.commandName,
            usageCount: 1,
            date: Date.now()
        });
    }

    await commandUsage.save();
}

// Function to handle guild-specific interactions
async function handleGuildInteraction(interaction) {
    const joinButton = new ButtonBuilder()
        .setLabel('Join the Uaenaverse Community Server')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/aQkUGvZmSu');

    const row = new ActionRowBuilder().addComponents(joinButton);

    await interaction.editReply({
        content: 'The Bot will be released to the public after the Beta Testing! Want to be the first ones to try it? Join the server.',
        components: [row],
        ephemeral: true
    });
}

// Function to handle user information
async function handleUserInfo(interaction) {
    const userInfo = await userBase.findOne({ user: interaction.user.id });

    if (!userInfo) {
        const fonts = await Font.find({ onMarket: false });
        const randomFont = fonts[Math.floor(Math.random() * fonts.length)];

        const embed = new EmbedBuilder()
            .setTitle('👋 Welcome to the Uaenaverse')
            .setDescription(`Here begins your journey. You've received the following.
                
                :one: 100 Koins 
                :two: 5 Aenas
                :three: ${randomFont.name} Font
                :four: Invite to an amazing server 🔽
                `)
            .setColor('#303135');

        const joinButton = new ButtonBuilder()
            .setLabel('Join the Uaenaverse Community Server')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/aQkUGvZmSu');

        const row = new ActionRowBuilder().addComponents(joinButton);

        await interaction.editReply({ embeds: [embed], components: [row] });

        const newUser = new userBase({
            user: interaction.user.id,
            balance: 100,
            aena: 5,
            favCard: "",
            favCardImage: "",
            lf: "Set this using /looking-for <message>",
            bio: "Set this using /bio <message>",
            joined: new Date().toISOString(),
            fonts: [{
                name: randomFont.name,
                total: 1,
                used: 0
            }]
        });

        console.log(`Saving new user: ${interaction.user.id}`);
        await newUser.save();
    }
}

// Function to parse interaction arguments
function parseInteractionArgs(interaction) {
    const args = [];

    for (let option of interaction.options.data) {
        if (option.type === "SUB_COMMAND") {
            if (option.name) args.push(option.name);
            option.options?.forEach((x) => {
                if (x.value) args.push(x.value);
            });
        } else if (option.value) args.push(option.value);
    }

    return args;
}

// Function to log command usage
function logCommandUsage(interaction) {
    const logMessage = `${new Date().toISOString()} - Command: ${interaction.commandName} | User: ${interaction.user.tag} (${interaction.user.id}) | Server: ${interaction.guild?.name || 'DM'} (${interaction.guildId})`;

    console.log(logMessage);
}
