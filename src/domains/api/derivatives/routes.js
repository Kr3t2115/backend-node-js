const express = require("express");
const { validateData } = require("./controller");
const { queryPairPrice, queryUserBalance } = require("./queries");
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
    leverage: req.body.leverage || 1
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
  const wallet = await queryUserBalance(req.user.id)
  
  if(wallet.balance < pairPrice * data.quantity){
    res.status(404).json({
      "error_message": "There was a problem with validation",
      "error_code": 1001
    });
    return;
  }

  

  console.log(validatedData);

  res.status(200).json({
    data
  });
});

module.exports = router;