const express = require("express");
const app = express();

require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/static")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

const port = process.env.PORT || 3001;
const server = app.listen(
  port,
  /*"0.0.0.0",*/ () => {
    console.log(`Listening to port ${port}`);
  }
);
