const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  name: String,
  act: String,
  group: String,
  rarity: String,
  act: String,
  code: String,
  image: String,
  owner: String,
});

module.exports = mongoose.model("issues", Schema);
