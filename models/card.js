const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  name: String,
  group: String,
  rarity: String,
  act: String,
  owner: String,
  date: String,
  issue: Number,
  code: String, 
  image: String,
  font: String,

});

module.exports = mongoose.model("cards", Schema);
