const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const path = require('path');
const userBase = require("../../models/user.js");
const cardBase = require("../../models/card.js");
const Font = require('../../models/fonts.js'); 

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
      return await interaction.editReply({ content: '`❌` User mentioned not found.', ephemeral: true });
    }

    const bio = player.bio;
    const lookingFor = player.lf;
    const balance = player.balance;
    const aena = player.aena;
    const favCard = player.favCard;
    const favCardImage = player.favCardImage;
    const joinedTimestamp = Math.floor(new Date(player.joined).getTime() / 1000);

    let description = `${bio}\n\n\`🔍\` **Looking For** : ${lookingFor}\n\`🌐\` **Joined** : <t:${joinedTimestamp}:F>\n\n\`🪙\` **Koins** : ${balance}\n\`🍓\` **Aena** : ${aena}\n`;
    let embedOptions = {
      author: { name: user.tag || 'Profile', iconURL: user.displayAvatarURL({ dynamic: true }) },
      description,
      color: parseInt('#eea990', 16)  // Convert hex color to integer
    };

    if (favCard) {
      const lookup = await cardBase.findOne({ code: favCard });
      if (lookup) {
        const { name: cardName, act: cardAct, font: fontFamily } = lookup;
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
        const actYOffset = isBigFont ? 5 : 0;

        ctx.fillStyle = 'white'; 
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6;

        console.log(`Using font: ${fontFamily || 'default'}, Default font size: ${defaultFontSize}, Smaller font size: ${smallerFontSize}, Act font size: ${actFontSize}`);

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

        embedOptions = {
          ...embedOptions,
          description, // Ensure the description includes the favorite card
          image: { url: 'attachment://favCard.webp' }  // Corrected to an object with a url property
        };

        await interaction.editReply({
          embeds: [new EmbedBuilder(embedOptions)],
          files: [attachment],
        });
      } else {
        description += `\`🎴\` **Favorite Card** : ${favCard}\n`;
        embedOptions.description = description; // Update the description
        await interaction.editReply({
          embeds: [new EmbedBuilder(embedOptions)],
        });
      }
    } else {
      await interaction.editReply({
        embeds: [new EmbedBuilder(embedOptions)],
      });
    }
  }
};
