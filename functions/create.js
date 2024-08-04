const Bots = require("../models/bot.js");
const Users = require("../models/user.js");
const Servers = require("../models/server.js");


module.exports = {


    bot: async function (id) {
        var bot = await Bots.create({
            id: id,
            color: "#36393e",
            status: "Coming Soon....",
            boosterRole: "1234834374902681651"
        })
        return bot;
    },

    user: async function (id) {
        var data = await Users.create({
            id,
            xp: 0
        })

        return data;
    },


    server: async function (id) {
        var data = await Servers.create({
            id: id,
            disabled: []
        })
        return data;
    }
}