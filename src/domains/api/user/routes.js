const express = require("express");
const router = express.Router();

router.get("/logout", (req, res) => {
  res.clearCookie('token')
  res.json({
    "logout": "wylogowano"
  })
})

router.get("/ping", (req, res) => {
  res.status(200).json({
    "response": "pong"
  })
})

module.exports = router