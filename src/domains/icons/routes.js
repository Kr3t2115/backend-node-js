const express = require("express");
const router = express.Router();

// user login and registration routes
router.get("/:cryptocurrencies", (req, res) =>{
    res.sendFile(__dirname + '/assets/' + req.params.cryptocurrencies + '.svg')
});

module.exports = router;