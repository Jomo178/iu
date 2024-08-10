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
            user: id,
            balance: 100,
            aena: 5,
            favCard: "",
            favCardImage: "",
            lf: "Set this using /looking-for <message>",
            bio: "Set this using /bio <message>",
            joined: new Date().toISOString()
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