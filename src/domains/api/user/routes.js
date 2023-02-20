const express = require("express");
const router = express.Router();

// function that logut user
router.get("/logout", (req, res) => {
  res.clearCookie('token');
  res.json({
    "logout": "wylogowano"
  });
});

// funny ping pong answer function
router.get("/ping", (req, res) => {
  res.status(200).json({
    "response": "pong"
  });
});

module.exports = router;