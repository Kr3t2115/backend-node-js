const express = require("express");
const router = express.Router();

const spotBalance = require("./balance/spotBalance");
const spotBalanceByPair = require("./balance/spotBalanceByPair");

const buyCryptoByMarket = require("./market/buyCrypto");
const sellCryptoByMarket = require("./market/sellCrypto");

const buyCryptoByLimit = require("./limit/buyCrypto");


router.use("/balance", spotBalance);
router.use("/balance", spotBalanceByPair);

router.use("/market", buyCryptoByMarket);
router.use("/market", sellCryptoByMarket);

router.use("/limit", buyCryptoByLimit);


module.exports = router;