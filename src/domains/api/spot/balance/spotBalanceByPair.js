const express = require("express");
const getUserWallet = require("../../../../services/getUserWallet");

const router = express.Router();

/**
 * POST /api/spot/balance/:pair
 * @summary Pair cryptocurrencies balance
 * @tags spot
 * @param {string} pair.required - Cryptocurrencies pair
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "ETHUSDT": 0.4
 * }
 */ 

// user spot balance route, returns the current spot account balance for requested pair
router.get("/:pair", async (req, res) => {
  const wallet = await getUserWallet(req.user.id);
  
  res.status(200).json({
    [req.params.pair]: wallet.spotBalance[req.params.pair]
  });
});

module.exports = router;