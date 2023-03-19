const express = require("express");
const spotAllPositions = require("./spot/positionsAll");
const spotPositionsByPair = require("./spot/positionsByPair");
const futuresAllPositions = require("./futures/positionsAll");
const futuresPositionsByPair = require("./futures/positionsByPair");

const router = express.Router();

// routes to positions in the spot market
router.use("/spot", spotAllPositions);
router.use("/spot", spotPositionsByPair);

// routes to positions in the futures market
router.use("/futures", futuresAllPositions);
router.use("/futures", futuresPositionsByPair);

module.exports = router;