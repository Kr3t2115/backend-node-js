const express = require("express");
const router = express.Router();
const {queryEmail, registerUser, queryAccount, registerWallet} = require('./queries');
const {validateRegister, hashPassword, generateJWT, validateLogin, comparePassword} = require('./controller');

// login user route, returns jwt token as http token
router.post("/login", async (req, res) => {
  try {
    // declare object with data from request
    const loginData = {
      email: req.body.email.toLowerCase(),
      password: req.body.password
    }

    // function that validate login data, returns error code if validation rejected, or false if validation passed
    const validateError = validateLogin(loginData)
    if (validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      })
      return;
    }

    // function that checks if the entered email is in the database, returns false if email not found, else returns user information
    const accountExists = await queryAccount(loginData.email)
    if(!accountExists){
      res.status(404).json({
        "error_message": "We cant find account with that email",
        "error_code": 190
      })
      return;
    }
    
    // function that compares the entered password with the user's password in the database, returns true if the passwords match, else return false
    const passwordMatch = comparePassword(req.body.password, accountExists.password)
    
    if(passwordMatch){
      const token = generateJWT(loginData.email, accountExists.id); // function that returns jwt token. Accepts values added to payload, such as email and user id
      res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + 72000000)})
      res.status(200).json({
        "success_message": "Login success",
        "success_code": 132,
        "token": token
      })
    }else{
      res.status(404).json({
        "error_message": "We cant compare password with that email",
        "error_code": 191
      })
      return;
    }

  } catch (error) {
    res.status(404).json({
      "error_message": "An unknown error occurred",
      "error_code": 191
    })
  }
})

// register user route, returns jwt token as http token
router.post("/register", async (req, res) => {
  try {
    // declare object with data from request
    const registerData = {
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "email": req.body.email.toLowerCase(),
      "password": req.body.password
    }

    // function that validate register data, returns error code if validation rejected, or false if validation passed
    const validateError = validateRegister(registerData)
    if(validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      })
      return;
    }

    // function that checks if the entered email is in the database, returns false if email not found, else returns true
    const emailBusy = await queryEmail(registerData.email)
    if(emailBusy){
      res.status(409).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 121
      })
      return;
    }

    // function that hashes a password, returns a hash
    const hashedPassword = hashPassword(registerData.password)
    // function that insert user data into the database, returns true if added successfully otherwise returns false
    const registerPassed = registerUser(registerData, hashedPassword)

    if(registerPassed){
      // function that returns the details of the user who has registered
      const userData = await queryAccount(registerData.email)

      // function that registers the user's wallet, returns true if added successfully otherwise returns false
      const walletRegister = await registerWallet(userData.id)

      if(!walletRegister){
        res.status(500).json({
          "error_message": "There was a problem with adding the wallet to the system",
          "error_code": 123
        })
        return;
      }
      
      // function that returns jwt token. Accepts values added to payload, such as email and user id
      const token = generateJWT(registerData.email, userData.id); 
      res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + 72000000)})
      res.status(200).json({
        "success_message": "The account has been successfully registered",
        "success_code": 131,
        "token": token
      })
    }else{
      res.status(500).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 122
      })
      
    }
  } catch (error) {
    res.status(500).json({
      "error_message": "There was a unidentified problem",
      "error_code": 123
    })
  }
})


module.exports = router;