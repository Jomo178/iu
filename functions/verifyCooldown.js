const { EmbedBuilder, InteractionType } = require("discord.js");
module.exports = async function(client, message, command, time){

    if(message.type === InteractionType.ApplicationCommand) {
        let cd = await client.cd.checkCoolDown(message.user.id, command);

        let reducedCooldownPerksChannel = await client.channels.fetch("984951314578542622");
        let reducedCooldownsList = reducedCooldownPerksChannel.members;
        let rc = reducedCooldownsList.find(mem => mem.id === message.user.id);
        
        let boosterServer = reducedCooldownPerksChannel.guild;
        let member = await boosterServer.members.fetch(message.user.id).catch(err => {});
        if(member) {
            let booster = member.roles.cache.has("970402931243385004");
            if(booster) time *= 1-0.35;
        }

        if(rc) time *= 1-0.20;
        
        let embed = new EmbedBuilder()
        .setColor(client.bot.color)
        .setAuthor({name: `${message.user.tag} | Cooldown`, iconURL: message.user.displayAvatarURL({dynamic: true})})
        .setDescription(`You can use the command \`${command}\` <t:${cd.unixTime}:R>.`)
    
        if(!cd.ready){
            message.followUp({embeds: [embed]});
    
            return true;
        } 
    
        client.cd.addCoolDown(message.user.id, time, command)
    } else {
    let cd = await client.cd.checkCoolDown(message.author.id, command);

    let reducedCooldownPerksChannel = await client.channels.fetch("984951314578542622");
    let reducedCooldownsList = reducedCooldownPerksChannel.members;
    let rc = reducedCooldownsList.find(mem => mem.id === message.author.id);

    if(rc) time *= 1-0.20;
    
    let embed = new EmbedBuilder()
    .setColor(client.bot.color)
    .setAuthor({name: `${message.author.tag} | Cooldown`, iconURL: message.author.displayAvatarURL({dynamic: true})})
    .setDescription(`You can use the command \`${command}\` <t:${cd.unixTime}:R>.`)

    if(!cd.ready){
        message.reply({embeds: [embed]});

        return true;
    } 

    client.cd.addCoolDown(message.author.id, time, command)
    }
    
}
