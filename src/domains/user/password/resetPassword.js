const express = require("express");
const router = express.Router();
const { sendInformationMail } = require('./sendEmail');
const { queryAccount, checkCode, updatePassword } = require('../queries');
const { hashPassword, comparePassword } = require('../controller');
const jwt = require("jsonwebtoken");

// reset password route
router.post("/password", async (req, res) => {
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
      email: req.body.email || req.user.email,
      code: req.body.code,
      password: req.body.password
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

    // Check if password is valid
    if(data.password.length < 8 || !data.password.match(/\d/) || !data.password.match(/[a-z]/) || !data.password.match(/[A-Z]/)){
      res.status(404).json({
        "error_message": "Invalid password",
        "error_code": 101
      });
      return;
    }

    // Check if code is valid
    const isCodeValid = await checkCode(user.id, data.code);

    // If code is not valid, return error
    if(!isCodeValid){
      res.status(404).json({
        "error_message": "Invalid code passed",
        "error_code": 362
      });
      return;
    }

    // Check if passwords are the same
    const passwordMatch = comparePassword(data.password, user.password);

    // If passwords are the same, return error
    if(passwordMatch){
      res.status(404).json({
        "error_message": "Passwords cant be the same",
        "error_code": 111
      });
      return;
    }

    // Hash password
    const hashedPassword = hashPassword(data.password);

    // Update password in database
    const update = await updatePassword(user.id, hashedPassword);

    // If update failed, return error
    if(!update){
      res.status(404).json({
        "error_message": "An unexpected error",
        "error_code": 321
      });
      return;
    }

    // Send email with information about password change to user email
    try {
      const result = await sendInformationMail(data.email, user.username);
      console.log(result);
    } catch (error) {
      res.status(500).json({
        "error_message": "There was a problem with sending the confirmation code, please try again later, or with another email address",
        "error_code": 123
      });
      return;
    }

    // Clear cookies
    res.clearCookie('ACCESS_TOKEN', {sameSite: "none", secure: true});
    res.clearCookie('REFRESH_TOKEN', {sameSite: "none", secure: true});

    // Return success message
    res.status(200).json({
      "success_message": "Successfully reset password",
      "success_code": 100
    });

  } catch (error) {
    // If error, return error message
    console.log(error)
    res.status(500).send('An unexpected error');  
  }
})

module.exports = router;