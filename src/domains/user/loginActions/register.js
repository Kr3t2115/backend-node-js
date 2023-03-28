const express = require("express");
const router = express.Router();
const { registerUser, queryAccount } = require('../queries');
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
      "password": req.body.password
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

    // function that hashes a password, returns a hash
    const hashedPassword = hashPassword(registerData.password);
    // function that insert user data into the database, returns true if added successfully otherwise returns false
    const registerPassed = await registerUser(registerData.firstname, registerData.lastname, registerData.email, hashedPassword);

    if(!registerPassed){
      res.status(500).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 122
      });
    }

    // function that returns jwt token. Accepts values added to payload, such as email and user id
    const token = generateJWT(registerData.email, registerPassed);
    res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + 72000000)});
    res.status(200).json({
      "success_message": "The account has been successfully registered",
      "success_code": 131,
      "token": token
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