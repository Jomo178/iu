const { Schema, model } = require('mongoose')

var schema = new Schema({
    command: String,
    cooldown: String,
    userID: String,
    reminded: Boolean
})

module.exports = model('commands', schema)