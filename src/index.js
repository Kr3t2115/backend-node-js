require("dotenv").config({path: "env/.env"});
const server = require("./server");
const getCryptoPrices = require("./util/getCryptoPrice");
const port = process.env.PORT;

const startServer = () => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  })
}

startServer();
getCryptoPrices();
