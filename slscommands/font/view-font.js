const { CommandInteraction, Client, AttachmentBuilder, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const Canvas = require("@napi-rs/canvas");
const path = require('path');
const Font = require('../../models/fonts.js');

module.exports = {
    name: 'preview-font',
    category: 'fonts',
    description: 'Preview what a font looks like',
    options: [
        { 
            name: 'fontname', 
            type: ApplicationCommandOptionType.String, 
            description: 'Name of the font to preview', 
            required: true,
            autocomplete: true // Enable autocomplete
        }
    ],
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    run: async (client, interaction) => {
        let fontName = interaction.options.getString('fontname');

        // Capitalize the font name
        fontName = fontName
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Find the font in the database
        const font = await Font.findOne({ name: fontName });
        if (!font) {
            return await interaction.editReply({
                content: `The font **${fontName}** does not exist.`,
                ephemeral: true
            });
        }

        // Prepare the canvas
        const canvas = Canvas.createCanvas(800, 300);
        const ctx = canvas.getContext('2d');

        // Load and apply the font
        Canvas.GlobalFonts.registerFromPath(path.join(__dirname, `../../fonts/${fontName}.ttf`), fontName);
        
        // Fill the canvas with a background color
        ctx.fillStyle = '#202225'; // Dark background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set text color, size, and font
        const fontSize = 100;
        ctx.fillStyle = '#F5E8DD'; // Light text color
        ctx.font = `${fontSize}px "${fontName}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Render the font name in the middle of the canvas
        ctx.fillText(fontName, canvas.width / 2, canvas.height / 2);

        // Create an attachment with the canvas image
        const attachment = new AttachmentBuilder()
            .setFile(await canvas.encode('png'))
            .setName('font-preview.png');

        // Create an embed
        const embed = new EmbedBuilder()
            .setTitle(`Font Preview: ${fontName}`)
            .setDescription(`Here is a preview of the font **${fontName}**`)
            .setColor('#2b2d31')
            .setImage('attachment://font-preview.png') // Set the image from the attachment

        // Reply with the embed and attachment
        await interaction.editReply({
            embeds: [embed],
            files: [attachment]
        });
    },

    // Autocomplete handler
    autocomplete: async (interaction) => {
        const focusedValue = interaction.options.getFocused();
        
        // Fetch the fonts from the database (only onMarket fonts)
        const fonts = await Font.find({ onMarket: true });

        // Filter fonts based on user input
        const filtered = fonts
            .filter(f => f.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .map(f => ({ name: f.name, value: f.name }))
            .slice(0, 25); // Discord has a limit of 25 choices

        await interaction.respond(filtered);
    }
};
