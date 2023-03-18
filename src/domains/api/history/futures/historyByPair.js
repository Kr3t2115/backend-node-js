const express = require("express");
const { queryFuturesHistoryPair } = require("../queries");

const router = express.Router()

router.get("/last/:pair", async (req, res) => {

  // function takes user id and pair given in request, returns user's historical positions
  const trades = await queryFuturesHistoryPair(req.user.id, req.params.pair);

  if(!trades){
    res.status(200).json(null)
    return;
  }

  res.status(200).json(trades);
});

module.exports = router;