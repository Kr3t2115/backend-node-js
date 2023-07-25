const express = require("express");
const router = express.Router();
const { getUser, updateAccount, queryAccountUsername } = require('../queries');

router.patch("/update", async (req, res) => {
  try {
    const user = await getUser(req.user.id);

    if(!user){
      res.status(404).json({
        "error_message": "We cant find your user data",
        "error_code": 100
      });
      return;
    }

    const data = {
      firstname: req.body.firstname || user.firstname,
      lastname: req.body.lastname || user.lastname,
      username: req.body.username || user.username
    };
    
    const username = await queryAccountUsername(req.body.username, req.user.id);

    if(username){
      res.status(404).json({
        "error_message": "Username taken",
        "error_code": 111
      });
      return;
    }

    const result = await updateAccount(data.firstname, data.lastname, data.username, req.user.id);

    if(!result){
      res.status(404).json({
        "error_message": "Error on updating account",
        "error_code": 100
      });
      return;
    }

    res.status(200).json({
      "success_message": "Successfully updated account",
      "success_code": 100
    });

  } catch (error) {
    console.log(error)
    res.status(500).send('An unexpected error');  
  }
})

module.exports = router;