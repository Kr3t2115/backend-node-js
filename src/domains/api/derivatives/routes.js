const express = require("express");

const router = express.Router();

const openPosition = require("./market/openPosition");
const closePosition = require("./market/closePosition");
const updatePosition = require("./position/updatePosition");
const openPositionLimit = require("./limit/openPosition");
const closePositionLimit = require("./limit/closeLimitOrder");
const limitOrders = require("./limit/limitOrders");
const limitHistory = require("./limit/limitHistory");

// routes to open and close a position by the market price
router.use("/market", openPosition);
router.use("/market", closePosition);

router.use("/limit", openPositionLimit);
router.use("/limit", closePositionLimit);
router.use("/limit", limitOrders);
router.use("/limit", limitHistory);

// routes to update a position
router.use("/position", updatePosition);

module.exports = router;