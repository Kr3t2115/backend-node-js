const express = require("express");
const { getSpotHistoryPair } = require("../queries");

const router = express.Router();  

/**
 * POST /api/history/spot/last/:pair
 * @summary Cryptocurrencies spot history by pair
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
        "sellingPrice": 1763.92,
        "date": "2023-03-28T13:02:23.079Z",
        "userId": 3
    },
]
 */ 

// route that returns the last 20 historical positions for the spot market and the given pair
router.get("/last/:pair", async (req, res) => {

  // function takes user id and pair given in request, returns user's historical positions
  const trades = await getSpotHistoryPair(
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