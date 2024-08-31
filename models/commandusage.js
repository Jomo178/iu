const mongoose = require("mongoose");

const CommandUsageSchema = new mongoose.Schema({
  user: String,
  server: String,
  command: String,
  usageCount: { type: Number, default: 1 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CommandUsage", CommandUsageSchema);
