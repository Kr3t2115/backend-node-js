const express = require("express");
const router = express.Router();
const { queryAccount, checkCode, activeAccount, insertRefreshToken } = require('../queries');
const { generateJWT, validateLogin, comparePassword } = require('../controller');

// route checks if the account with the given email exists
router.post("/email", async (req, res) => {
  try {
    const data = {
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      code: Number(req.body.code)
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

    if(!passwordMatch){
      res.status(404).json({
        "error_message": "We cant compare password with that email",
        "error_code": 191
      });
      return;
    }

    if(accountExists.isActive == true){
      res.status(404).json({
        "error_message": "Your account is already active",
        "error_code": 191
      });
      return;
    }

    const codeMatch = await checkCode(accountExists.id, data.code);

    if(!codeMatch){
      res.status(404).json({
        "error_message": "Confirmation code is incorrect",
        "error_code": 192
      });
      return;
    }

    const accountActive = await activeAccount(accountExists.id)

    if(!accountActive){
      res.status(404).json({
        "error_message": "An unexpected error has occurred",
        "error_code": 998
      });
      return;
    }

    // function that returns jwt token. Accepts values added to payload, such as email and user id
    const {ACCESS_TOKEN, REFRESH_TOKEN} = generateJWT(data.email, accountExists.id);
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
      "success_message": "Your account has been successfully activated.",
      "success_code": 131,
      "ACCESS_TOKEN": ACCESS_TOKEN,
      "REFRESH_TOKEN": REFRESH_TOKEN
    });

  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error_message": "An unexpected error has occurred",
      "error_code": 999
    })
  }
})

module.exports = router;