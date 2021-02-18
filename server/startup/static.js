const express = require("express");

module.exports = function (app) {
  app.use("/media", express.static("media"));
};
