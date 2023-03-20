const express = require("express");
const getUserWallet = require("../../../../services/getUserWallet");

const router = express.Router();

// user spot balance route, returns the current spot account balance for requested pair
router.get("/:pair", async (req, res) => {
  const wallet = await getUserWallet(req.user.id);
  
  res.status(200).json({
    [req.params.pair]: wallet.spotBalance[req.params.pair]
  });
});

module.exports = router;