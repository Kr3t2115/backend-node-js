const express = require("express");
const { getSpotHistory } = require("../queries");

const router = express.Router();  

/**
 * POST /api/history/spot/last/
 * @summary Cryptocurrencies spot history
 * @tags history
 * @param {string} pair.required - Cryptocurrencies pair
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 *  [
    {
        "id": 1,
        "pair": "ETHUSDT",
        "quantity": 0.2,
        "purchasePrice": 1763.92,
        "sellingPrice": 1762.92,
        "date": "2023-03-28T13:02:23.079Z",
        "userId": 3
    },
    {
        "id": 2,
        "pair": "BTCUSDT",
        "quantity": 0.2,
        "purchasePrice": 19000.92,
        "sellingPrice": 22000.32,
        "date": "2023-03-28T13:02:23.079Z",
        "userId": 3
    }
]
 */ 

// route that returns the last 20 historical positions for the spot market and the given pair
router.get("/last", async (req, res) => {

  // function takes user id given in request, returns user's historical position 
  const trades = await getSpotHistory(req.user.id);

  if(!trades){
    res.status(200).json(null)
    return;
  }
  
  res.status(200).json(trades);
});

module.exports = router;