const express = require("express");
const { getFuturesPositionsAll } = require("../queries");
const router = express.Router();

/**
 * GET /api/futures/futures
 * @summary User futures positions 
 * @tags positions
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * [
    {
        "id": 30,
        "pair": "BTCUSDT",
        "type": "SHORT",
        "quantity": 0.2,
        "leverage": 3,
        "purchasePrice": 26950.7,
        "takeProfit": null,
        "stopLoss": null,
        "userId": 5,
        "liquidationPrice": 35934.26666666667
    },
    {
        "id": 31,
        "pair": "ETHUSDT",
        "type": "SHORT",
        "quantity": 0.2,
        "leverage": 3,
        "purchasePrice": 1735.65,
        "takeProfit": null,
        "stopLoss": null,
        "userId": 5,
        "liquidationPrice": 2314.2000000000003
    }
]
*/ 


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