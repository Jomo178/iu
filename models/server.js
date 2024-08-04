const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    id: String,
    disabled: []
})

module.exports = mongoose.model('servers', Schema)