const express = require("express");
const { getFuturesPositionsByPair } = require("../queries");
const router = express.Router();

/**
 * GET /api/positions/futures/:pair
 * @summary User spot positions by pair
 * @tags positions
 * @param {string} pair.required - Cryptocurrencies pair
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * [
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