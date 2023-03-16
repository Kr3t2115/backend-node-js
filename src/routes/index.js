const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cors = require('cors');

const apiRoutes = require("../domains/api/routes");
const userRoutes = require("../domains/user/routes");
const cryptocurrenciesRoutes = require("../domains/cryptoPrices/routes");

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (token == null){
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
    if (err) 
      return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.use("/user", userRoutes);
router.use("/cryptocurrencies", cryptocurrenciesRoutes);
router.use(authenticateToken);
router.use("/api", apiRoutes);


module.exports = router; 