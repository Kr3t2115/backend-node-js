const { getRefreshToken } = require("../queries");
const jwt = require('jsonwebtoken');
const express = require("express");
const router = express.Router();

router.get("/token", async (req, res) => {
    
  const token = req.cookies.REFRESH_TOKEN
    
  try {
    const isToken = await getRefreshToken(token);
    if(!isToken){
      res.status(403).json({
        "error": "error1"
      })
      return;
    }

    jwt.verify(token, process.env.REFRESH_KEY, (err, data) => {
      if(err){
        res.status(403).json({
          "error": "error2"
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
      res.status(200).json({
          "success": "success"
      });
    })
  } catch (error) {
    console.log(error)
    res.status(403).json({
      "error": "error3"
    })
  }
})

module.exports = router;