const express = require("express");
const getUserWallet = require("../../../services/getUserWallet");
const router = express.Router();
const currentBalancePredicted = require("./predictedBalance/currentBalance");
const previousBalancePredicted = require("./predictedBalance/previousBalance");

/**
 * GET /api/wallet/balance
 * @summary User wallet route
 * @tags wallet
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "currentBalance": 1500,
 *  "spotBalance":{"ETHUSDT": 1.2},
 *  "futureBalance": {"BTCUSDT": 0.2}
 * }
 * @return {object} 404 - failed response - application/json
 * @example response - 404 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 101
 * }
 */ 
// user balance route, returns the current account balance
router.get("/balance", async (req, res) => {
  // function returning current account balance, accepts user id from jwt payload
  const walletInfo = await getUserWallet(req.user.id);

  if(!walletInfo){
    res.status(404).json({
      "error_message": "There was no known issue, no wallet was found for this account",
      "error_code": 101
    });
    return;
  }

  res.status(200).json({
    "currentBalance": walletInfo.balance,
    "spotBalance": walletInfo.spotBalance,
    "futureBalance": walletInfo.futureBalance
  });
});

router.use('/predicted', currentBalancePredicted);
router.use('/predicted', previousBalancePredicted);

module.exports = router;