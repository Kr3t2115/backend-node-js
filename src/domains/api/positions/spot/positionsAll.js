const express = require("express");
const { getSpotPositionsAll } = require("../queries");
const router = express.Router();

/**
 * GET /api/positions/spot
 * @summary User spot positions 
 * @tags positions
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * [
    {
        "id": 8,
        "pair": "ETHUSDT",
        "quantity": 0.4,
        "purchasePrice": 1734.7450000000003,
        "userId": 5
    },
    {
        "id": 9,
        "pair": "BTCUSDT",
        "quantity": 0.2,
        "purchasePrice": 26911.95,
        "userId": 5
    }
]
*/ 

// route returns the currently open positions in the spot market by the user
router.get("/", async (req, res) => {

  // function accepts the user id and returns the currently opened positions by the user in the spot market
  const positions = await getSpotPositionsAll(req.user.id);

  if(positions){
    res.status(200).json(positions);
    return;
  }
  res.status(200).json(null)
});

module.exports = router;