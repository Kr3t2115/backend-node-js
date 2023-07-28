const express = require("express");
const router = express.Router();
const { sendConfirmEmail } = require('./sendEmail');
const { queryAccount, insertConfirmationCode } = require('../queries');
const jwt = require("jsonwebtoken");

router.post("/password/code", async (req, res) => {
  try {
    token = req.cookies.ACCESS_TOKEN;

    const isError = jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
      if (!err){
        req.user = user;
      }else{
          return true;
      }
    });
    
    if(isError && !req.body.email){
      res.status(401).json({
        "error_message": "No email provided",
        "error_code": 100
      });
    return;
    }
        
    const data = {
      email: req.body.email || req.user.email
    };

    const user = await queryAccount(data.email);

    if(!user || user.isActive == false){
      res.status(404).json({
        "error_message": "Error on getting user data",
        "error_code": 100
      });
      return;
    }

    function generateRandomSixDigitNumber() {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    const code = generateRandomSixDigitNumber();

    const insertCode = await insertConfirmationCode(user.id, code);

    if(!insertCode){
      res.status(404).json({
        "error_message": "Error on insert code to database",
        "error_code": 101
      });
      return;
    }

    try {
      const result = await sendConfirmEmail(data.email, code, user.username);
      console.log(result);
    } catch (error) {
      res.status(500).json({
        "error_message": "There was a problem with sending the confirmation code, please try again later, or with another email address",
        "error_code": 123
      });
      return;
    }

    res.status(200).json({
      "success_message": "Successfully send confirmation code",
      "success_code": 100
    });

  } catch (error) {
    console.log(error)
    res.status(500).send('An unexpected error');  
  }
})

module.exports = router;