const express = require("express");
const router = express.Router();
const { sendInformationMail } = require('./sendEmail');
const { queryAccount, checkCode, updatePassword } = require('../queries');
const { hashPassword, comparePassword } = require('../controller');

router.post("/check/code", async (req, res) => {
  try {
    const data = {
      email: req.body.email || req.user.email,
      code: req.body.code,
    };

    const user = await queryAccount(data.email);

    if(!user || user.isActive == false){
      res.status(404).json({
        "error_message": "Error on getting user data",
        "error_code": 100
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

    res.status(200).json({
      "success_message": "Code is valid",
      "success_code": 100
    });

  } catch (error) {
    console.log(error)
    res.status(500).send('An unexpected error');  
  }
})

module.exports = router;