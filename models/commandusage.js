const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  command: String,
  usageCount: Number,

});

module.exports = mongoose.model("commandusage", Schema);
