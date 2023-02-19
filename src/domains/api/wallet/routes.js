const express = require("express");
const queryBalance = require("./queries");
const router = express.Router();

router.get("/balance", async (req, res) => {
  const walletInfo = await queryBalance(req.user.id);

  if(!walletInfo){
    res.status(404).json({
      "error_message": "There was no known issue, no wallet was found for this account",
      "error_code": 101
    })
    return;
  }

  res.status(200).json({
    "currentBalance": walletInfo.balance
  })
})

module.exports = router