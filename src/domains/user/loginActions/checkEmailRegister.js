const express = require("express");
const router = express.Router();
const { queryAccount } = require('../queries');

// route checks if the account with the given email exists
router.post("/email/register", async (req, res) => {
  try {
    const data = {
      email: req.body.email.toLowerCase()
    }

    // function that asks the database if the user with the given e-mail exists
    const accountExists = await queryAccount(data.email)

    if(accountExists){
      res.status(404).json({
        "error_message": "An account with the given email address exists",
        "error_code": 190
      });
      return;
    }

    // if it does not exists, return code 200
    res.status(200).json({
      "success_message": "We cant find account with that email",
      "success_code": 200
    })

  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error_message": "An unexpected error has occurred",
      "error_code": 999
    })
  }
})

module.exports = router;