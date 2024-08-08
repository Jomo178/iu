const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  name: String,
  act: String,
  group: String,
  rarity: String,
  code: String,
  image: String,
});

module.exports = mongoose.model("issue", Schema);
