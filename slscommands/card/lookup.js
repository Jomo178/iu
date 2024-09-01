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
  run: async (client, interaction, args) => {
    const user = interaction.user;
    const cardCode = interaction.options.getString("code");

    const lookup = await cardBase.findOne({ code: cardCode }).lean().exec();

    if (!lookup) {
      return await interaction.followUp({
        content: "`❌` This card does not exist in the database.",
        ephemeral: true,
      });
    }

    const { name: cardName, act: cardAct, rarity: cardRarity, owner: cardOwner, image: cardImage, font: fontFamily, date } = lookup;

    let createdTimestamp = "N/A";
    if (date) {
      createdTimestamp = Math.floor(new Date(date).getTime() / 1000);
    }

    const description = [
      `**Name:** ${cardName}`,
      `**Act:** ${cardAct}`,
      `**Rarity:** ${getRarity(Number(cardRarity))}`,
      `**Owner:** <@${cardOwner}>`,
      `**Issued:** ${createdTimestamp === "N/A" ? "N/A" : `<t:${createdTimestamp}:F>`}`,
    ].join("\n");

    const canvas = Canvas.createCanvas(600, 800);
    const ctx = canvas.getContext('2d');

    const [cardImageLoaded, font] = await Promise.all([
      Canvas.loadImage(cardImage),
      fontFamily ? Font.findOne({ name: fontFamily }).lean().exec() : Promise.resolve(null)
    ]);

    ctx.drawImage(cardImageLoaded, 0, 0, canvas.width, canvas.height);

    let isBigFont = false;

    if (font) {
      Canvas.GlobalFonts.registerFromPath(path.join(__dirname, `../../fonts/${fontFamily}.ttf`), fontFamily);
      isBigFont = font.isBig;
    }

    const defaultFontSize = isBigFont ? 65 : 75;
    const smallerFontSize = isBigFont ? 55 : 60;
    const actFontSize = 30;
    const actYOffset = isBigFont ? 5 : 0;

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 6;

    const drawText = (text, x, y, fontSize) => {
      ctx.font = `${fontSize}px "${fontFamily || 'default'}"`;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    };

    if (cardName.length > 7) {
      drawText(cardName, 84, 731, smallerFontSize);
      drawText(cardAct, 84, 731 - (smallerFontSize - actYOffset), actFontSize);
    } else {
      drawText(cardName, 84, 731, defaultFontSize);
      drawText(cardAct, 84, 731 - (defaultFontSize - actYOffset), actFontSize);
    }

    const attachment = new AttachmentBuilder()
      .setFile(await canvas.encode('webp'))
      .setName('lookup.png');

    const embed = new EmbedBuilder()
      .setAuthor({ name: user.tag || "Lookup", iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`${user} searched for \n\`\`\`${cardCode}\`\`\`\n${description}`)
      .setColor("#F5E8DD")
      .setImage('attachment://lookup.png');

    await interaction.followUp({ embeds: [embed], files: [attachment] });
  },
};
