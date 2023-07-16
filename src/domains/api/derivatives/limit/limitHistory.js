const express = require("express");
const { getLimitHistory, getLimitHistoryConditional, getLimitHistoryByPair, getLimitHistoryByPairConditional } = require("../queries");
const router = express.Router();

router.get("/history", async (req, res) => {
  try {
    const history = await getLimitHistory(req.user.id);    

    if(!history){
      res.status(404).json({
        "error_message": "There was a problem with finding an order with the given id",
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
    const history = await getLimitHistoryConditional(req.user.id, req.params.from);    

    if(!history){
      res.status(404).json({
        "error_message": "There was a problem with finding an order with the given id",
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
    const history = await getLimitHistoryByPair(req.user.id, req.params.pair);    

    if(!history){
      res.status(404).json({
        "error_message": "There was a problem with finding an order with the given id",
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
    const history = await getLimitHistoryByPairConditional(req.user.id, req.params.pair, req.params.from);    

    if(!history){
      res.status(404).json({
        "error_message": "There was a problem with finding an order with the given id",
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