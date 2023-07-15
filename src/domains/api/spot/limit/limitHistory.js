const express = require("express");
const { getLimitOrdersHistory } = require("../queries");
const router = express.Router();

router.get("/history", async (req, res) => {
  try {
    const history = await getLimitOrdersHistory(req.user.id);    

    if(!history){
      res.status(404).json({
        "error_message": "There was a problem with finding an history with the given user id",
        "error_code": 110
      });
      return;
    }

    res.status(200).json(history);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
})

module.exports = router;