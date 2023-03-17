const express = require("express");

const router = express.Router();

const openPosition = require("./market/openPosition");
const closePosition = require("./market/closePosition");
const updatePosition = require("./position/updatePosition");

// routes to open and close a position by the market price
router.use("/market", openPosition);
router.use("/market", closePosition);

router.use("/position", updatePosition);


module.exports = router;