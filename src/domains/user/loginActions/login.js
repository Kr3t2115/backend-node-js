const express = require("express");
const router = express.Router();
const { queryAccount, insertRefreshToken } = require('../queries');
const { generateJWT, validateLogin, comparePassword } = require('../controller');

/**
 * POST /user/login
 * @summary User login route
 * @tags login
 * @param {string} email.required - User email
 * @param {string} password.required - User password
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "success_message": "Login success",
 *  "success_code": 132,
 *  "token": "token jwt"
 * }
 * @return {object} 400 - failed response - application/json
 * @example response - 400 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 100
 * }
 * @return {object} 404 - failed response - application/json
 * @example response - 404 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 100
 * }
 */ 

// login user route, returns jwt token as http token
router.post("/", async (req, res) => {
  try {
    // declare object with data from request
    const loginData = {
      email: req.body.email.toLowerCase(),
      password: req.body.password
    }

    // function that validate login data, returns error code if validation rejected, or false if validation passed
    const validateError = validateLogin(loginData);
    if (validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      });
      return;
    }

    // function that checks if the entered email is in the database, returns false if email not found, else returns user information
    const accountExists = await queryAccount(loginData.email);
    if(!accountExists){
      res.status(404).json({
        "error_message": "We cant find account with that email",
        "error_code": 190
      });
      return;
    }
    
    // function that compares the entered password with the user's password in the database, returns true if the passwords match, else return false
    const passwordMatch = comparePassword(req.body.password, accountExists.password);
    
   if(passwordMatch){
      const {ACCESS_TOKEN, REFRESH_TOKEN} = generateJWT(loginData.email, accountExists.id); // function that returns jwt token. Accepts values added to payload, such as email and user id

      const addRefreshToken = insertRefreshToken(REFRESH_TOKEN);
      if(!addRefreshToken){
        res.status(404).json({
          "error_message": "Error with refresh token",
          "error_code": 190
        });
        return;
      }

      res.cookie('ACCESS_TOKEN', ACCESS_TOKEN, {sameSite: "none", secure: true, httpOnly: true, expires: new Date(Date.now() + 5 * 60 * 1000)});
      res.cookie('REFRESH_TOKEN', REFRESH_TOKEN, {sameSite: "none", secure: true, httpOnly: true, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)});
      res.status(200).json({
        "success_message": "Login success",
        "success_code": 132,
        "ACCESS_TOKEN": ACCESS_TOKEN,
        "REFRESH_TOKEN": REFRESH_TOKEN
      });
    }else{
      res.status(404).json({
        "error_message": "We cant compare password with that email",
        "error_code": 191
      });
      return;
    }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error_message": "An unknown error occurred",
      "error_code": 191
    });
  }
});

module.exports = router;