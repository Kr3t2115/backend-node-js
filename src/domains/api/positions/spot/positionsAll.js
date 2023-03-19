const express = require("express");
const { getSpotPositionsAll } = require("../queries");
const router = express.Router();

// route returns the currently open positions in the spot market by the user
router.get("/", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user in the spot market
  const positions = await getSpotPositionsAll(req.user.id);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
});

module.exports = router;