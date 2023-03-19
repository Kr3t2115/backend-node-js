const express = require("express");
const { getFuturesPositionsByPair } = require("../queries");
const router = express.Router();

// route returns the currently open positions in the futures market by the user and passed pair
router.get("/:pair", async (req, res) => {

  const pair = req.params.pair;

  // function accepts the user id and the pair accepted in the pararam, returns the currently open positions in a given pair by the user
  const positions = await getFuturesPositionsByPair(req.user.id, pair);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
  
});

module.exports = router;