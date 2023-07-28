const express = require("express");
const router = express.Router();
const { sendInformationMail } = require('./sendEmail');
const { queryAccount, checkCode, updatePassword } = require('../queries');
const { hashPassword, comparePassword } = require('../controller');
const jwt = require("jsonwebtoken");

router.post("/password", async (req, res) => {
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
      email: req.body.email || req.user.email,
      code: req.body.code,
      password: req.body.password
    };

    const user = await queryAccount(data.email);

    if(!user || user.isActive == false){
      res.status(404).json({
        "error_message": "Error on getting user data",
        "error_code": 100
      });
      return;
    }

    if(data.password.length < 8 || !data.password.match(/\d/) || !data.password.match(/[a-z]/) || !data.password.match(/[A-Z]/)){
      res.status(404).json({
        "error_message": "Invalid password",
        "error_code": 101
      });
      return;
    }

    const isCodeValid = await checkCode(user.id, data.code);

    if(!isCodeValid){
      res.status(404).json({
        "error_message": "Invalid code passed",
        "error_code": 362
      });
      return;
    }

    const passwordMatch = comparePassword(data.password, user.password);

    if(passwordMatch){
      res.status(404).json({
        "error_message": "Passwords cant be the same",
        "error_code": 111
      });
      return;
    }

    const hashedPassword = hashPassword(data.password);

    const update = await updatePassword(user.id, hashedPassword);

    if(!update){
      res.status(404).json({
        "error_message": "An unexpected error",
        "error_code": 321
      });
      return;
    }

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

    res.clearCookie('ACCESS_TOKEN', {sameSite: "none", secure: true});
    res.clearCookie('REFRESH_TOKEN', {sameSite: "none", secure: true});

    res.status(200).json({
      "success_message": "Successfully reset password",
      "success_code": 100
    });

  } catch (error) {
    console.log(error)
    res.status(500).send('An unexpected error');  
  }
})

module.exports = router;