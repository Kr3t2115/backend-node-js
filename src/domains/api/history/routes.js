const express = require("express");
const { querySpotHistoryPair, querySpotHistory } = require("./queries");
const router = express.Router();  

router.get("/spot/last/:pair", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user
  const trades = await querySpotHistoryPair(req.user.id, req.params.pair);

  if(!trades){
    res.status(200).json(null)
    return;
  }

  res.status(200).json(trades);
});

router.get("/spot/last", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user
  const trades = await querySpotHistory(req.user.id);

  if(!trades){
    res.status(200).json(null)
    return;
  }
  
  res.status(200).json(trades);
});

router.get("/derivatives/last", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user
  const trades = await querySpotHistory(req.user.id);

  if(!trades){
    res.status(200).json(null)
    return;
  }
  
  res.status(200).json(trades);
});

module.exports = router;