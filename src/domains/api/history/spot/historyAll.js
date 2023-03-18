const express = require("express");
const { querySpotHistory } = require("../queries");

const router = express.Router();  

// route that returns the last 20 historical positions for the spot market and the given pair
router.get("/last", async (req, res) => {

  // function takes user id given in request, returns user's historical position 
  const trades = await querySpotHistory(req.user.id);

  if(!trades){
    res.status(200).json(null)
    return;
  }
  
  res.status(200).json(trades);
});

module.exports = router;