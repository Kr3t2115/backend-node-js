const express = require("express");
const getUserWallet = require("../../../../services/getUserWallet");

const router = express.Router();

// user spot balance route, returns the current spot account balance
router.get("/", async (req, res) => {
  const wallet = await getUserWallet(req.user.id);

  res.status(200).json(
    wallet.spotBalance
  );
});

module.exports = router;