const express = require("express");
const { getFuturesHistory } = require("../queries");

const router = express.Router();  

/**
 * POST /api/history/futures/last/
 * @summary Cryptocurrencies futures history
 * @tags history
 * @param {string} pair.required - Cryptocurrencies pair
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 *  [
    {
        "id": 2,
        "pair": "BTCUSDT",
        "quantityPosition": 0.1,
        "quantitySold": 0.1,
        "leverage": 2,
        "purchasePrice": 28053,
        "sellingPrice": 28053.6,
        "date": "2023-03-31T06:13:46.241Z",
        "userId": 2
    },
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

// route that returns the last 20 historical positions for the futures market
router.get("/last", async (req, res) => {

  // function takes user id given in request, returns user's historical position
  const trades = await getFuturesHistory(req.user.id);

  if(!trades){
    res.status(200).json(null)
    return;
  }
  
  res.status(200).json(trades);
});

module.exports = router;