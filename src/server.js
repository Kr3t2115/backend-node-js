const app = require("express")();
const cors = require('cors')
const routes = require("./routes")

app.use(cors())
app.use(routes)

module.exports = app;