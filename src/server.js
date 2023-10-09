require("./config/db");

const app = require("express")();
const bodyParser = require('express').json;
const cors = require('cors');
const routes = require("./routes");
const cookies = require("cookie-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocumentOne = require('./swagger-output.json');

app.use(
    cors({ 
        credentials: true, 
        origin: "http://127.0.0.1:5173", 
        exposedHeaders: ["Set-Cookie"] 
    })
);

var options = {}

app.use('/api-docs', swaggerUi.serveFiles(swaggerDocumentOne, options), swaggerUi.setup(swaggerDocumentOne));

app.use(cookies());
app.use(bodyParser());
app.use(routes);

module.exports = app;