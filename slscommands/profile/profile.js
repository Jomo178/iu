const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const path = require('path');
const userBase = require("../../models/user.js");
const cardBase = require("../../models/card.js");
const Font = require('../../models/fonts.js'); // Ensure this model exists

module.exports = {
  name: 'profile',
  category: 'profile',
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
      return await interaction.followUp({ content: '`❌` User mentioned not found.', ephemeral: true });
    }

    const bio = player.bio;
    const lookingFor = player.lf;
    const balance = player.balance;
    const aena = player.aena;
    const favCard = player.favCard;
    const favCardImage = player.favCardImage;
    const joinedTimestamp = Math.floor(new Date(player.joined).getTime() / 1000);

    const lookup = await cardBase.findOne({ code: favCard });
    const { name: cardName, act: cardAct, font: fontFamily } = lookup;

    let description = `${bio}\n\n\`🔍\` **Looking For** : ${lookingFor}\n\`🌐\` **Joined** : <t:${joinedTimestamp}:F>\n\n\`🪙\` **Koins** : ${balance}\n\`🍓\` **Aena** : ${aena}\n`;
    if (favCard) {
      description += `\`🎴\` **Favorite Card** : ${favCard}\n`;

      const canvas = Canvas.createCanvas(600, 800);
      const ctx = canvas.getContext('2d');

      let favCardImageLoaded = await Canvas.loadImage(favCardImage);
      ctx.drawImage(favCardImageLoaded, 0, 0, canvas.width, canvas.height);

      let isBigFont = false;

      if (fontFamily) {
        const font = await Font.findOne({ name: fontFamily });
        if (font) {
          Canvas.GlobalFonts.registerFromPath(path.join(__dirname, `../../fonts/${fontFamily}.ttf`), fontFamily);
          isBigFont = font.isBig;
        } else {
          console.warn(`Font ${fontFamily} not found.`);
        }
      }

      const defaultFontSize = isBigFont ? 65 : 75;
      const smallerFontSize = isBigFont ? 55 : 60;
      const actFontSize = 30;
      const actYOffset = isBigFont ? 5 : 0; // Adjust vertical position for act text
    
      ctx.fillStyle = 'white'; 
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 6;
  
      console.log(`Using font: ${fontFamily || 'default'}, Default font size: ${defaultFontSize}, Smaller font size: ${smallerFontSize}, Act font size: ${actFontSize}`);
  
      // Draw card name
      if (cardName.length > 7) {
        ctx.font = `${smallerFontSize}px "${fontFamily || 'default'}"`;
        ctx.strokeText(cardName, 84, 731); 
        ctx.fillText(cardName, 84, 731); 
  
        ctx.font = `${actFontSize}px "${fontFamily || 'default'}"`;
        ctx.strokeText(cardAct, 84, 731 - (smallerFontSize - actYOffset));
        ctx.fillText(cardAct, 84, 731 - (smallerFontSize - actYOffset)); 
      } else {
        ctx.font = `${defaultFontSize}px "${fontFamily || 'default'}"`;
        ctx.strokeText(cardName, 84, 731);
        ctx.fillText(cardName, 84, 731); 
  
        ctx.font = `${actFontSize}px "${fontFamily || 'default'}"`;
        ctx.strokeText(cardAct, 84, 731 - (defaultFontSize - actYOffset)); 
        ctx.fillText(cardAct, 84, 731 - (defaultFontSize - actYOffset)); 
      }
  
      const attachment = new AttachmentBuilder()
        .setFile(await canvas.encode('webp'))
        .setName('favCard.webp');

      const embed = new EmbedBuilder()
        .setAuthor({ name: user.tag || 'Profile', iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(description)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setImage('attachment://favCard.webp');

      await interaction.followUp({
        embeds: [embed],
        files: [attachment],
      });
    } else {
      const embed = new EmbedBuilder()
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setDescription(description)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setColor('#F6F7C4');

      await interaction.followUp({ embeds: [embed] });
    }
  }
};
