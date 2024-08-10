const Commands = require("../models/commands.js");
const moment = require("moment");
module.exports = {
    addCoolDown: async function(userID, time, command) {
        if(!userID) return console.error("No userID supplied");
        if(!command) return console.error("No commmand name supplied");
        if(!time) return console.error("No time supplied");

        if(isNaN(time)) return console.error("Time supplied is not a number");

        let newCd = moment(new Date()).add(time, "milliseconds").format('DD/MM/YYYY HH:mm:ss')

        var existing = await Commands.findOne({userID: userID, command: command});

        if(!existing){ 
            await Commands.create({
                command: command,
                cooldown: newCd,
                userID: userID
            })
        } else {
            existing.reminded = false;
            existing.cooldown = newCd;
            await existing.save()
        }
        
        return moment(newCd, "DD/MM/YYYY HH:mm:ss").valueOf();
    },

    checkCoolDown: async function(userID, command) {
        if(!userID) return console.error("No userID supplied");
        if(!command) return console.error("No commmand name supplied");
        var existing = await Commands.findOne({userID: userID, command: command});

        if(!existing) {
            let object = {
                ready: true,
                time: null,
                command: command,
                reminded: true
            }
            return object;
        }

        var milliseconds = moment.duration(moment(existing.cooldown, "DD/MM/YYYY HH:mm:ss").diff(moment(new Date(), "DD/MM/YYYY HH:mm:ss"))).asMilliseconds();

        if(milliseconds > 0) {
            let object = {
                ready: false,
                time: milliseconds,
                command: command,
                unixTime: moment(existing.cooldown, "DD/MM/YYYY HH:mm:ss").unix(),
                reminded: existing.reminded
            }
            return object;
        } 
        let object = {
            ready: true,
            time: null,
            command: command,
            unixTime: moment(existing.cooldown, "DD/MM/YYYY HH:mm:ss").unix(),
            reminded: existing.reminded
        }
        return object;
    },
    
    setReminded: async function(userID, command) {
        var existing = await Commands.findOne({userID: userID, command: command});

        if(!existing){ 
            await Commands.create({
                command: command,
                userID: userID,
                reminded: true
            })
        } else {
            existing.reminded = true;
            await existing.save()
        }
        
    }
}