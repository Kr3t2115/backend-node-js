const express = require("express");
const { querySpotHistoryPair } = require("./queries");
const router = express.Router();  

router.get("/spot/last/:pair", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user
  const trades = await querySpotHistoryPair(req.user.id, req.params.pair);

  if(trades){
    res.status(200).json(trades);
    return;
  }
  res.status(200).json(null)
  
});

module.exports = router;