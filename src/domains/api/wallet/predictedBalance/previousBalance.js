const express = require("express");
const { getPredictedBalance } = require("../queries");
const router = express.Router();

router.get("/last/:numberOfDays", async (req, res) => {
  try {
    const predictedBalance = await getPredictedBalance(req.params.numberOfDays, req.user.id);    

    if(!predictedBalance){
      res.status(404).json({
        "error_message": "There was a problem with finding an predicted balance data",
        "error_code": 110
      });
      return;
    }

    res.status(200).json(predictedBalance);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
})

module.exports = router;