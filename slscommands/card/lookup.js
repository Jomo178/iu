const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const path = require('path');
const cardBase = require("../../models/card.js");
const getRarity = require("../../functions/getRarity.js");
const Font = require('../../models/fonts.js');

module.exports = {
  name: "lookup",
  category: "card",
  description: "Lookup for any card from the Uaenaverse",
  options: [
    { name: 'code', type: 3, description: 'Card code you want to search up', required: true }
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    const user = interaction.user;
    const cardCode = interaction.options.getString("code");
    const lookup = await cardBase.findOne({ code: cardCode });

    if (!lookup) {
      return await interaction.editReply({
        content: "`❌` This card does not exist in the database.",
        ephemeral: true,
      });
    }

    const { name: cardName, act: cardAct, rarity: cardRarity, owner: cardOwner, image: cardImage, font: fontFamily } = lookup;

    let createdDate = new Date(lookup.date);
    let createdTimestamp = "N/A";
    if (!isNaN(createdDate.getTime())) {
      createdTimestamp = Math.floor(createdDate.getTime() / 1000);
    }

    const description = [
      `**Name:** ${cardName}`,
      `**Act:** ${cardAct}`,
      `**Rarity:** ${getRarity(cardRarity)}`,
      `**Owner:** <@${cardOwner}>`,
      `**Issued:** ${
        createdTimestamp === "N/A" ? "N/A" : `<t:${createdTimestamp}:F>`
      }`,
    ].join("\n");

    const canvas = Canvas.createCanvas(600, 800);
    const ctx = canvas.getContext('2d');

    let cardImageLoaded = await Canvas.loadImage(cardImage);
    ctx.drawImage(cardImageLoaded, 0, 0, canvas.width, canvas.height);

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
    ctx.lineWidth = 5;

    console.log(`Using font: ${fontFamily || 'default'}, Default font size: ${defaultFontSize}, Smaller font size: ${smallerFontSize}, Act font size: ${actFontSize}`);

    // Draw card name
    if (cardName.length > 7) {
      ctx.font = `${smallerFontSize}px "${fontFamily || 'default'}"`;
      ctx.strokeText(cardName, 84, 726); 
      ctx.fillText(cardName, 84, 726); 

      ctx.font = `${actFontSize}px "${fontFamily || 'default'}"`;
      ctx.strokeText(cardAct, 84, 724 - (smallerFontSize - actYOffset));
      ctx.fillText(cardAct, 84, 724 - (smallerFontSize - actYOffset)); 
    } else {
      ctx.font = `${defaultFontSize}px "${fontFamily || 'default'}"`;
      ctx.strokeText(cardName, 84, 726);
      ctx.fillText(cardName, 84, 726); 

      ctx.font = `${actFontSize}px "${fontFamily || 'default'}"`;
      ctx.strokeText(cardAct, 84, 724 - (defaultFontSize - actYOffset)); 
      ctx.fillText(cardAct, 84, 724 - (defaultFontSize - actYOffset)); 
    }

    const attachment = new AttachmentBuilder()
      .setFile(await canvas.encode('png')) 
      .setName('lookup.png');

    const embed = new EmbedBuilder()
      .setAuthor({
        name: user.tag || "Lookup",
        iconURL: user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `${user} searched for \n\`\`\`${cardCode}\`\`\`\n${description}`
      )
      .setColor("#F5E8DD")
      .setImage('attachment://lookup.png');

    await interaction.editReply({
      embeds: [embed],
      files: [attachment],
    });
  },
};
