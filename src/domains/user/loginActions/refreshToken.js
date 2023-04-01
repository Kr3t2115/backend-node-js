const { getRefreshToken } = require("../queries");
const jwt = require('jsonwebtoken');
const express = require("express");
const router = express.Router();

router.post("/token", (req, res) => {
  try {
    const token = req.cookies.REFRESH_TOKEN;

    console.log(req.cookies)

    const isToken = getRefreshToken(token);
    if(!isToken){
      res.status(403).json({
        "error": "error"
      })
      return;
    }

    jwt.verify(token, process.env.REFRESH_TOKEN, (err, data) => {
      if(err){
        res.status(403).json({
          "error": "error"
        })
        return;
      }
      const payload = {
        id: data.id,
        email: data.email
      }
      const ACCESS_TOKEN = jwt.sign(payload, 
        process.env.ACCESS_KEY, 
        {
          expiresIn: '5m'
      })
      res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, {sameSite: "none", secure: true, httpOnly: true, expires: new Date(Date.now() + 5 * 60 * 1000)});
      res.status(200);
    })
  } catch (error) {
    console.log(error)
    res.status(403).json({
      "error": "error"
    })
  }
})

module.exports = router;