const express = require("express");
const { getFuturesHistoryPair } = require("../queries");

const router = express.Router()

/**
 * POST /api/history/futures/last/:pair
 * @summary Cryptocurrencies futures history by pair
 * @tags history
 * @param {string} pair.required - Cryptocurrencies pair
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 *  [
    {
        "id": 1,
        "pair": "ETHUSDT",
        "quantityPosition": 1,
        "quantitySold": 1,
        "leverage": 2,
        "purchasePrice": 1801.95,
        "sellingPrice": 1801.76,
        "date": "2023-03-30T12:28:02.883Z",
        "userId": 2
    }
]
 */ 

router.get("/last/:pair", async (req, res) => {

  // function takes user id and pair given in request, returns user's historical positions
  const trades = await getFuturesHistoryPair(req.user.id, req.params.pair);

  if(!trades){
    res.status(200).json(null)
    return;
  }

  res.status(200).json(trades);
});

module.exports = router;