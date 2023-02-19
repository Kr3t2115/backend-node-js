const express = require("express");
const router = express.Router();
const {queryEmail, registerUser, queryAccount, registerWallet} = require('./queries');
const {validateRegister, hashPassword, generateJWT, validateLogin, comparePassword} = require('./controller');

router.post("/login", async (req, res) => {
  try {
    const loginData = {
      email: req.body.email.toLowerCase(),
      password: req.body.password
    }

    const validateError = validateLogin(loginData)
    if (validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      })
      return;
    }

    const doesAccountExists = await queryAccount(loginData.email)

    if(!doesAccountExists){
      res.status(404).json({
        "error_message": "We cant find account with that email",
        "error_code": 190
      })
      return;
    }
    
    const isPasswordValid = comparePassword(req.body.password, doesAccountExists.password)
    
    if(isPasswordValid){
      const token = generateJWT(loginData.email, doesAccountExists.id);
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
    
  }
})


router.post("/register", async (req, res) => {
  try {
    const registerData = {
      "firstname": req.body.firstname,
      "lastname": req.body.lastname,
      "email": req.body.email.toLowerCase(),
      "password": req.body.password
    }

    const validateError = validateRegister(registerData)
    if(validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      })
      return;
    }

    const isEmailBusy = await queryEmail(registerData.email)
    if(isEmailBusy != 0){
      res.status(409).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 121
      })
      return;
    }

    const hashedPassword = hashPassword(registerData.password)

    const registerPassed = registerUser(registerData, hashedPassword)

    if(registerPassed){
      const userData = await queryAccount(registerData.email)

      const isWalletRegister = await registerWallet(userData.id)

      if(!isWalletRegister){
        res.status(500).json({
          "error_message": "There was a problem with adding the wallet to the system",
          "error_code": 123
        })
        return;
      }

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
    console.log(error)
    res.status(500).json({
      "error_message": "There was a unidentified problem",
      "error_code": 123
    })
  }
})


module.exports = router;