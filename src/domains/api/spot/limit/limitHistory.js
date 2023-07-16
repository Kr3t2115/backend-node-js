const express = require("express");
const { getLimitOrdersHistory, getLimitOrdersHistoryConditional, getLimitOrdersHistoryByPair, getLimitOrdersHistoryByPairConditional } = require("../queries");
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

router.get("/history/from/:from", async (req, res) => {
  try {
    const history = await getLimitOrdersHistoryConditional(req.user.id, req.params.from);    

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

router.get("/history/pair/:pair", async (req, res) => {
  try {
    const history = await getLimitOrdersHistoryByPair(req.user.id, req.params.pair);    

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

router.get("/history/pair/:pair/from/:from", async (req, res) => {
  try {
    const history = await getLimitOrdersHistoryByPairConditional(req.user.id, req.params.pair, req.params.from);    

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