const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  name: String,
  idol: String,
  group: String,
  rarity: String,
  act: String,
  code: String,
  image: String,
  owner: String,
  date: String,
  issue: Number,
});

module.exports = mongoose.model("cards", Schema);
