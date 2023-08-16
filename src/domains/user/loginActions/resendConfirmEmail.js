const express = require("express");
const router = express.Router();
const { sendConfirmEmail } = require('./sendEmail');
const { queryAccount, renewCode } = require('../queries');
const { validateLogin, comparePassword } = require('../controller');

// resend confirmation code route
router.post("/resend", async (req, res) => {
  try {
    // define data
    const data = {
      email: req.body.email.toLowerCase(),
      password: req.body.password,
    }

    // function that validate login data, returns error code if validation rejected, or false if validation passed
    const validateError = validateLogin(data);
    if (validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      });
      return;
    }

    // function that checks if the entered email is in the database, returns false if email not found, else returns user information
    const accountExists = await queryAccount(data.email);
    if(!accountExists){
      res.status(404).json({
        "error_message": "We cant find account with that email",
        "error_code": 190
      });
      return;
    }

    // function that compares the entered password with the user's password in the database, returns true if the passwords match, else return false
    const passwordMatch = comparePassword(req.body.password, accountExists.password);

    // check if password match
    if(!passwordMatch){
      res.status(404).json({
        "error_message": "We cant compare password with that email",
        "error_code": 191
      });
      return;
    }

    // check if account is active
    if(accountExists.isActive == true){
      res.status(404).json({
        "error_message": "Your account is already active",
        "error_code": 191
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

    // Send email function
    try {
      const result = await sendConfirmEmail(data.email, code);
      console.log(result);
    } catch (error) {
      res.status(500).json({
        "error_message": "There was a problem with sending the confirmation code, please try again later, or with another email address",
        "error_code": 123
      });
      return;
    }

    // Insert code to database
    const newCode = await renewCode(accountExists.id, code);

    // Check if code is inserted
    if(!newCode){
      res.status(404).json({
        "error_message": "An error occurred while generating a new code",
        "error_code": 392
      });
      return;
    }

    // Return success message
    res.status(200).json({
      "success_message": "The new code has been successfully generated",
      "success_code": 131
    });

  } catch (error) {
    // If error, return error message
    console.log(error);
    res.status(404).json({
      "error_message": "An unexpected error has occurred",
      "error_code": 999
    })
  }
})

module.exports = router;