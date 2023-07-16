const express = require("express");
const { getLimitOrders, getLimitOrdersByPair } = require("../queries");
const router = express.Router();

router.get("/orders", async (req, res) => {
  try {
    const orders = await getLimitOrders(req.user.id);    

    if(!orders){
      res.status(404).json({
        "error_message": "There was a problem with finding an order with the given id",
        "error_code": 110
      });
      return;
    }

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
})


router.get("/orders/pair/:pair", async (req, res) => {
  try {
    const orders = await getLimitOrdersByPair(req.user.id, req.params.pair);    

    if(!orders){
      res.status(404).json({
        "error_message": "There was a problem with finding an order with the given id",
        "error_code": 110
      });
      return;
    }

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
})

module.exports = router;