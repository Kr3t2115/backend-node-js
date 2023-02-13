const express = require("express");
const router = express.Router();
const queryUsers = require('./queries');

router.get("/", (req, res) => {
  queryUsers((error, result) => {
    if (error) throw error
    res.status(200).json(result.rows)
  })
})

module.exports = router;