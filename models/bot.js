const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    id: String,
    color: String,
    status: String,
    blacklistServers: Array,
    blacklistUsers: Array,
})

module.exports = mongoose.model('bot', Schema)