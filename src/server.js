require("./config/db");

const app = require("express")();
const bodyParser = require('express').json;
const cors = require('cors');
const routes = require("./routes");
const cookies = require("cookie-parser");

app.use(cookies());
app.use(bodyParser());
app.use(cors());
app.use(routes);

module.exports = app;