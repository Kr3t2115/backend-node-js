const express = require("express");
const { getFuturesPositionsAll } = require("../queries");
const router = express.Router();

// route returning the currently open positions in the futures market by the user
router.get("/", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user in the futures market
  const positions = await getFuturesPositionsAll(req.user.id);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
});

module.exports = router;