const mongoose = require("mongoose");
const config = require("config");
const Fawn = require("fawn");

function trimQuotes(str) {
  return str.indexOf('"') !== -1 ? str.slice(1, str.length - 1) : str;
}

module.exports = function initDB() {
  const db = trimQuotes(config.get("db"));

  mongoose
    .connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(function log() {
      console.log(`Connected to ${db}...`);
      Fawn.init(mongoose);
    });
};
