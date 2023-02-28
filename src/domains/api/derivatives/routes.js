const express = require("express");
const { validateData } = require("./controller");
const { queryPairPrice } = require("./queries");
const router = express.Router();

// funny ping pong answer function
router.post("/market/open/:pair", async(req, res) => {

  // declare data object
  const data = {
    // required
    pair: req.params.pair,
    quantity: req.body.quantity,
    type: req.body.type, // Short or long 
    // optional
    takeProfit: req.body.takeProfit,
    stopLoss: req.body.stopLoss,
    laverage: req.body.laverage || 1
  }

  const validatedData = validateData(data);

  if(validatedData){
    res.status(404).json({
      "error_message": "There was a problem with validation",
      "error_code": validatedData
    });
    return;
  }

  const pairPrice = await queryPairPrice(data.pair)

  console.log(validatedData);

  res.status(200).json({
    data
  });
});

module.exports = router;