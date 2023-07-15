const express = require("express");
const router = express.Router();

const spotBalance = require("./balance/spotBalance");
const spotBalanceByPair = require("./balance/spotBalanceByPair");

const buyCryptoByMarket = require("./market/buyCrypto");
const sellCryptoByMarket = require("./market/sellCrypto");

const buyCryptoByLimit = require("./limit/buyCrypto");
const sellCryptoByLimit = require("./limit/sellCrypto");
const closeByLimit = require('./limit/closeLimit');
const limitOrders = require('./limit/limitOrders');
const limitHistory = require('./limit/limitHistory');


router.use("/balance", spotBalance);
router.use("/balance", spotBalanceByPair);

router.use("/market", buyCryptoByMarket);
router.use("/market", sellCryptoByMarket);

router.use("/limit", buyCryptoByLimit);
router.use("/limit", sellCryptoByLimit);
router.use("/limit", closeByLimit);
router.use("/limit", limitOrders);
router.use("/limit", limitHistory);

module.exports = router;