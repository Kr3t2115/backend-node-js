const express = require("express");
const router = express.Router();

/**
 * GET /icon/:cryptoName
 * @summary Crypto icons route
 * @tags icons
 * @param {string} cryptoName.required - cryptoName
 * @return {string} 200 - success response - image/svg
 */ 

// user login and registration routes
router.get("/:cryptocurrencies", (req, res) =>{
    res.status(200).sendFile(__dirname + '/assets/' + req.params.cryptocurrencies + '.svg')
});

module.exports = router;