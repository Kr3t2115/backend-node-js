const express = require("express");
const { querySpotHistoryPair } = require("../queries");

const router = express.Router();  

// route that returns the last 20 historical positions for the spot market and the given pair
router.get("/last/:pair", async (req, res) => {

  // function takes user id and pair given in request, returns user's historical positions
  const trades = await querySpotHistoryPair(
    req.user.id, 
    req.params.pair
  );

  if(!trades){
    res.status(200).json(null)
    return;
  }

  res.status(200).json(trades);
});

module.exports = router;