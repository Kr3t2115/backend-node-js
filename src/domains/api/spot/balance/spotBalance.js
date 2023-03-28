const express = require("express");
const getUserWallet = require("../../../../services/getUserWallet");

const router = express.Router();

/**
 * POST /api/spot/balance
 * @summary Cryptocurrencies balance
 * @tags spot
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 *  {
 *    "ETHUSDT": 11.2,
 *    "BTCUSDT": 1.2
 *  }
 */ 

// user spot balance route, returns the current spot account balance
router.get("/", async (req, res) => {
  const wallet = await getUserWallet(req.user.id);

  res.status(200).json(
    wallet.spotBalance
  );
});

module.exports = router;