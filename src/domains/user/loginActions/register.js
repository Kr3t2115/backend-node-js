const express = require("express");
const sendEmail = require('./sendEmail');
const router = express.Router();
const { registerUser, queryAccount, insertRefreshToken, queryAccountUsername } = require('../queries');
const { validateRegister, hashPassword, generateJWT } = require('../controller');

/**
 * POST /user/register
 * @summary User register route
 * @tags login
 * @param {string} firstname.required - firstname
 * @param {string} lastname.required - lastname
 * @param {string} email.required - User email
 * @param {string} password.required - User password
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "success_message": "The account has been successfully registered",
 *  "success_code": 131,
 *  "token": "token jwt"
 * }
 * @return {object} 400 - failed response - application/json
 * @example response - 400 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 100
 * }
 * @return {object} 409 - failed response - application/json
 * @example response - 409 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 100
 * }
 * @return {object} 500 - failed response - application/json
 * @example response - 500 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 100
 * }
 */ 

// register user route, returns jwt token as http token
router.post("/", async (req, res) => {
  try {
    // declare object with data from request
    const registerData = {
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "email": req.body.email.toLowerCase(),
      "password": req.body.password,
      "username": req.body.username
    }

    // function that validate register data, returns error code if validation rejected, or false if validation passed
    const validateError = validateRegister(registerData);
    if(validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      });
      return;
    }

    // function that checks if the entered email is in the database, returns false if email not found, else returns true
    const emailBusy = await queryAccount(registerData.email);
    if(emailBusy){
      res.status(409).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 121
      });
      return;
    }
    
    // function that checks if the entered email is in the database, returns false if email not found, else returns true
    const usernameBusy = await queryAccountUsername(registerData.username);
    if(usernameBusy || registerData.username.length > 64){
      res.status(409).json({
        "error_message": "There was a problem with adding the account to the system because the username was taken, check the error_code for more information",
        "error_code": 121
      });
      return;
    }

    function generateRandomSixDigitNumber() {
      const min = 100000;
      const max = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    const code = generateRandomSixDigitNumber();

    try {
      const result = await sendEmail(registerData.email, code);
      console.log(result);
      // Do something with the result if needed
    } catch (error) {
      res.status(500).json({
        "error_message": "There was a problem with sending the confirmation code, please try again later, or with another email address",
        "error_code": 123
      });
      return;
    }

    // function that hashes a password, returns a hash
    const hashedPassword = hashPassword(registerData.password);
    // function that insert user data into the database, returns true if added successfully otherwise returns false
    const registerPassed = await registerUser(registerData.firstname, registerData.lastname, registerData.email, hashedPassword, registerData.username, code);

    if(!registerPassed){
      res.status(500).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 122
      });
      return;
    }

    res.status(200).json({
      "success_message": "The account has been successfully registered, now please active your account",
      "success_code": 131
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      "error_message": "There was a unidentified problem",
      "error_code": 123
    });
  }
});

module.exports = router;