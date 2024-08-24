const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  name: String,
  price: Number,
  onMarket: Boolean,
  isBig: Boolean

});



module.exports = mongoose.model("fonts", Schema);
