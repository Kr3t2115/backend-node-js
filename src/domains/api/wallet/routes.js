const express = require("express");
const getUserWallet = require("../../../services/getUserWallet");
const router = express.Router();

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

module.exports = router;