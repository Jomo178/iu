const { Client, Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } = require("discord.js");
const userBase = require("../../models/user.js");

module.exports = async (client, interaction) => {
    if (interaction.isUserContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: false });
        const command = client.context.get(interaction.commandName);
        if (command) return command.run(client, interaction);
    }

    if (interaction.type === InteractionType.ApplicationCommand) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return interaction.followUp({ content: "An error has occurred." });

        if (!cmd.deferBypass) {
            await interaction.deferReply({ ephemeral: false }).catch(() => { });
        }

        const userInfo = await userBase.findOne({ user: interaction.user.id });

        if (!userInfo) {
            let embed = new EmbedBuilder()
                .setTitle('👋 Welcome to the Uaenaverse Industry')
                .setDescription(`Here begins your journey. Before starting, please read the terms below.
                
                :one: No alts.
                :two: Crosstrading is prohibited.
                :three: Do not abuse bugs.
                :four: Be respectful of all players.
                :five: No funneling.
                
                Breaking any of these terms will first lead to a permanent blacklist from the bot or a verbal warning based on the severity.`)
                .setColor('#303135');

            const joinButton = new ButtonBuilder()
                .setLabel('Join the Uaenaverse Community Server')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/delufe');

            const row = new ActionRowBuilder().addComponents(joinButton);
            await interaction.followUp({ embeds: [embed], components: [row] });

            const newUser = new userBase({
                user: interaction.user.id,
                balance: "100",
                aena: 5,
                favCard: "",
                favCardImage: "",
                lf: "Set this using /looking-for <message>",
                bio: "Set this using /bio <message>",
                joined: new Date().toISOString()
            });
            await newUser.save();
        }

        const args = [];

        for (let option of interaction.options.data) {
            if (option.type === "SUB_COMMAND") {
                if (option.name) args.push(option.name);
                option.options?.forEach((x) => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }

        interaction.member = interaction.guild.members.cache.get(interaction.user.id);

        cmd.run(client, interaction, args);
    }
}