const express = require("express");
const router = express.Router();
const {queryLoginUser, queryEmail, registerUser} = require('./queries');
const {validateRegister, checkPassword, hashPassword} = require('./controller');


router.get("/", (req, res) => {
  //res.clearCookie('token')
  res.send("xd")
})

router.post("/login", (req, res) => {
  try {

    const { email, password } = req.body;

    console.log(email, password)

    queryLoginUser(email, (error, result) => {
      if (error) 
        throw error
      else{
        checkPassword(password, result.rows, res)
        // res.status(200).json(result.rows)
      }
        
    })
  } catch (error) {
    res.status(400).send(error)
  }
  
})


router.post("/register", async (req, res) => {
  try {

    const validateError = validateRegister(req, res)
    if(validateError){
      res.status(400).json({
        "error_message": "There was a problem validating the submitted data, check the error_code for more information",
        "error_code": validateError
      })
      return;
    }

    const isEmailBusy = await queryEmail(req.body.email)
    if(isEmailBusy != 0){
      res.status(409).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 121
      })
      return;
    }

    const hashedPassword = hashPassword(req.body.password)

    const registerPassed = registerUser(req, hashedPassword)

    if(registerPassed){
      res.status(200).json({
        "success_message": "The account has been successfully registered",
        "success_code": 131
      })
    }else{
      res.status(500).json({
        "error_message": "There was a problem with adding the account to the system because the email address was taken, check the error_code for more information",
        "error_code": 122
      })
      
    }
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})


module.exports = router;