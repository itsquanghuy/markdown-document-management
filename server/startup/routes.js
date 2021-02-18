const express = require("express");
const fileUpload = require("express-fileupload");
const error = require("./../middleware/error");
const auth = require("./../routes/auth");
const users = require("./../routes/users");
const documents = require("./../routes/documents");

module.exports = function (app) {
  app.use(express.json());
  app.use(fileUpload({ createParentPath: true }));
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/documents", documents);
  app.use(error);
};
