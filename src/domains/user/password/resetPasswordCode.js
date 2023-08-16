const express = require("express");
const router = express.Router();
const { sendConfirmEmail } = require('./sendEmail');
const { queryAccount, insertConfirmationCode } = require('../queries');
const jwt = require("jsonwebtoken");

// reset password route to send code
router.post("/password/code", async (req, res) => {
  try {
    // Get token from cookies
    token = req.cookies.ACCESS_TOKEN;

    // Check if token is valid
    const isError = jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
      if (!err){
        req.user = user;
      }else{
          return true;
      }
    });
    
    // Check if email is provided
    if(isError && !req.body.email){
      res.status(401).json({
        "error_message": "No email provided",
        "error_code": 100
      });
    return;
    }
        
    // Define data
    const data = {
      email: req.body.email || req.user.email
    };

    // Get user data from database by email
    const user = await queryAccount(data.email);

    // Check if user exists and is active
    if(!user || user.isActive == false){
      res.status(404).json({
        "error_message": "Error on getting user data",
        "error_code": 100
      });
      return;
    }

    // Function to generate random six digit number
    function generateRandomSixDigitNumber() {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Generate random six digit number
    const code = generateRandomSixDigitNumber();

    // Insert code to database
    const insertCode = await insertConfirmationCode(user.id, code);

    // Check if code is inserted
    if(!insertCode){
      res.status(404).json({
        "error_message": "Error on insert code to database",
        "error_code": 101
      });
      return;
    }

    // Send email with code to user email
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

    // Return success message
    res.status(200).json({
      "success_message": "Successfully send confirmation code",
      "success_code": 100
    });

  } catch (error) {
    // If error, return error message
    console.log(error)
    res.status(500).send('An unexpected error');  
  }
})

module.exports = router;