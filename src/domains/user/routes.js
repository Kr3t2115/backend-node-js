const express = require("express");
const router = express.Router();
const queryLoginUser = require('./queries');
const checkPassword = require('./controller');

router.get("/", (req, res) => {
  //res.clearCookie('token')
  res.send("xd")
})

router.post("/login", (req, res) => {
  try {

    const { email, password } = req.body;

    console.log(email, password)

    queryLoginUser(email, (error, result) => {
      if (error) 
        throw error
      else{
        checkPassword(password, result.rows, res)
        // res.status(200).json(result.rows)
      }
        
    })
  } catch (error) {
    res.status(400).send(error)
  }
  
})

module.exports = router;