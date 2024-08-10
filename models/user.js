const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    user: String,
    balance: Number,
    aena: Number,
    favCard: String,
    favCardImage: String,
    lf: String,
    bio: String,
    joined: String,
    streak: Number,
    streakTime: Date,
})

module.exports = mongoose.model('user', Schema)