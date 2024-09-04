const { EmbedBuilder, InteractionType } = require("discord.js");

module.exports = async function(client, message, command, time){

    if(message.type === InteractionType.ApplicationCommand) {
        let cd = await client.cd.checkCoolDown(message.user.id, command);
        
        let embed = new EmbedBuilder()
        .setColor(client.bot.color)
        .setAuthor({name: `${message.user.tag} | Cooldown`, iconURL: message.user.displayAvatarURL({dynamic: true})})
        .setDescription(`The \`${command}\` command is on a cooldown for <t:${cd.unixTime}:R>.`)
    
        if(!cd.ready){
            message.editReply({embeds: [embed]});
    
            return true;
        } 
    
        client.cd.addCoolDown(message.user.id, time, command)
    } else {
    let cd = await client.cd.checkCoolDown(message.author.id, command);
    
    let embed = new EmbedBuilder()
    .setColor(client.bot.color)
    .setAuthor({name: `${message.author.tag} | Cooldown`, iconURL: message.author.displayAvatarURL({dynamic: true})})
    .setDescription(`The \`${command}\` command is on a cooldown for <t:${cd.unixTime}:R>.`)

    if(!cd.ready){
        message.reply({embeds: [embed]});

        return true;
    } 

    client.cd.addCoolDown(message.author.id, time, command)
    }
    
}
