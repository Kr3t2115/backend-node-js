const express = require("express");
const spotHistoryByPair = require("./spot/historyByPair");
const spotHistoryAll = require('./spot/historyAll');
const futuresHistoryByPair = require('./futures/historyByPair');
const futuresHistoryAll = require('./futures/historyAll');

const router = express.Router();  

// routes to the spot market
router.use("/spot", spotHistoryByPair);
router.use("/spot", spotHistoryAll);

// routes to the futures market
router.use("/futures", futuresHistoryByPair);
router.use("/futures", futuresHistoryAll);

module.exports = router;