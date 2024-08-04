const { EmbedBuilder } = require("discord.js");
const userBase = require("../../models/user.js");

module.exports = {
    name: 'profile',
    category: 'user',
    description: 'View the profile',
    options: [
        { type: 6, name: "user", description: "Target @member" }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        const user = interaction.options.getUser("user") || interaction.user;
        const player = await userBase.findOne({ user: user.id });

        if (!player) {
            return await interaction.followUp({ content: '\`❌\` User mentioned not found.', ephemeral: true });
        }

        const bio = player.bio
        const lookingFor = player.lf
        const balance = player.balance
        const aena = player.aena
        const favCard = player.favCard
        const favCardImage = player.favCardImage
        const joinedTimestamp = Math.floor(new Date(player.joined).getTime() / 1000);

        let description = `${bio}\n\n\`🔍\` **Looking For** : ${lookingFor}\n\`🌐\` **Joined** : <t:${joinedTimestamp}:F>\n\n\`🪙\` **Koins** : ${balance}\n\`🍓\` **Aena** : ${aena}\n`;
        if (favCard) {
            description += `\`🎴\` **Favorite Card** : ${favCard}\n`;
        }
    
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag || 'Profile', iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription(description)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })) 

        if (favCardImage && favCardImage.startsWith('http')) {
            embed.setImage(favCardImage);
        }

        await interaction.followUp({ embeds: [embed] });
    }
};
