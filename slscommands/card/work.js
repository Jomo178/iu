const { EmbedBuilder } = require("discord.js");
const userBase = require("../../models/user.js");
const verifyCD = require("../../functions/verifyCooldown.js");

module.exports = {
    name: 'work',
    category: 'user',
    description: 'Do some work',
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {

        let verify = await verifyCD(client, interaction, "work", 3600000);
        if (verify) return;

        const user = interaction.options.getUser("user") ? interaction.options.getUser("user") : interaction.user;
        const player = await userBase.findOne({ user: user.id });

        if (!player) {
            return await interaction.reply({ content: 'User not found in the database.', ephemeral: true });
        }

        const job = ['Cleaner', 'Stylist', 'Make Up Artist', 'Choreographer', 'Director', 'Manager'];
        const company = ['Hybe Labels', 'JYP Entertainment', 'YG Entertainment', 'SM Entertainment', 'Stone Music Entertainment', 'FNC Entertainment', 'Woollim Entertainment', 'Pledis Entertainment', 'DSP Media', 'KQ Entertainment', 'BarndNew Music', 'Jellyfish Entertainment', 'RBW', 'C9 Entertainment', 'MLD Entertainment', 'Warner Music Korea', 'Top Media Entertainment', 'Sublime Artist Agency', 'P Nation', 'Belift Lab', 'Cre.ker Entertainment', 'Sony Music Entertainment Korea', 'Source Music', 'Starship Entertainment', 'WAKEONE', 'Kakao M'];

        const job_done = Math.floor(Math.random() * job.length);
        const company_done = Math.floor(Math.random() * company.length);
        const amount = Math.floor(Math.random() * 50) + 1;

        await userBase.findOneAndUpdate(
            { user: user.id }, 
            { $inc: { balance: amount } }, 
            { new: true } 
        );

        console.log(`Amount earned: ${amount}`);

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag || 'Work', iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`${user.tag} worked as a **${job[job_done]}** at **${company[company_done]}** & earned \`${amount}\``)
            .setColor('#303135')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        await interaction.followUp({ embeds: [embed] });
    }
};
