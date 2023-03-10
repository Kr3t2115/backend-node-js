const express = require("express");
const { validateData } = require("./controller");
const { queryPairPrice, queryUserBalance, insertPosition, queryPosition, deletePosition } = require("./queries");
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
    takeProfit: req.body.takeProfit || null,
    stopLoss: req.body.stopLoss || null,
    leverage: req.body.leverage || 1
  }

  // function that returns the current price of the pair
  const pairPrice = await queryPairPrice(data.pair);
  
  if (!pairPrice){
    res.status(404).json({
      "error_message": "There is a problem with the specified cryptocurrency pair",
      "error_code": 999
    });
    return;
  }

  const validateError = validateData(data, pairPrice);

  if(validateError){
    res.status(404).json({
      "error_message": "There was a problem with validation",
      "error_code": validateError
    });
    return;
  }

  const wallet = await queryUserBalance(req.user.id)
  
  if (!wallet){
    res.status(404).json({
      "error_message": "There is a problem with the specified cryptocurrency pair",
      "error_code": 9991
    });
    return;
  }

  if(wallet.balance < pairPrice * data.quantity){
    res.status(404).json({
      "error_message": "There was a problem with validation",
      "error_code": 1001
    });
    return;
  }

  const liquidationPrice = pairPrice * data.quantity - pairPrice * data.quantity / data.leverage;

  const newAccountBalance = wallet.balance - pairPrice * data.quantity;

  let newFutureBalance = wallet.futureBalance;
  let position;

  if(!wallet.futureBalance?.[req.params.pair] || wallet.futureBalance?.[req.params.pair] == 0){
    newFutureBalance = {};
    newFutureBalance[req.params.pair] = Number(data.quantity).toFixed(1);
    
    console.log(newFutureBalance);

    // the function that adds an position to the database, accepts the pair name, quantity, purchase price and user id
    position = await insertPosition(data.pair, data.type, data.quantity, data.leverage, pairPrice, data.takeProfit, data.stopLoss, req.user.id, liquidationPrice, newAccountBalance, JSON.stringify(newFutureBalance))
  
  }else{
    const cryptoBalance = Number(data.quantity) + Number(wallet.futureBalance[req.params.pair]);
    newFutureBalance[req.params.pair] = cryptoBalance.toFixed(1);

    position = await insertPosition(data.pair, data.type, data.quantity, data.leverage, pairPrice, data.takeProfit, data.stopLoss, req.user.id, liquidationPrice, newAccountBalance, JSON.stringify(newFutureBalance))
  }

  if(!position){
    res.status(404).json({
      "error_message": "There was a problem with validation",
      "error_code": 10012
    });
    return; 
  }

  res.status(200).json({
    data
  });
});

router.post("/market/close/:id", async(req, res) => {
  try {

    const position = await queryPosition(req.params.id, req.user.id);

    if(!position){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 100121
      });
      return; 
    }

    const pairPrice = await queryPairPrice(position.pair);

    if(!pairPrice){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 100125
      });
      return; 
    }

    const wallet = await queryUserBalance(req.user.id)
    
    if(!wallet){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 100124
      });
      return; 
    }

    let profit;

    if(position.type == "LONG"){
      profit = pairPrice * position.quantity * position.leverage - position.purchasePrice * position.quantity * position.leverage;
    }else{
      profit = position.purchasePrice * position.quantity * position.leverage - pairPrice * position.quantity * position.leverage;
    }

    const newAccountBalance = wallet.balance + (position.purchasePrice * position.quantity + profit);

    let newFuturesBalance = wallet.futureBalance;
    newFuturesBalance[position.pair] = newFuturesBalance[position.pair] - position.quantity

    const updateBalance = await deletePosition(req.params.id, req.user.id, newAccountBalance, JSON.stringify(newFuturesBalance))

    if(!updateBalance){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 100123
      });
      return; 
    }

    res.status(200).json({
      position
    });
  } catch (error) {
    console.log(error)
  }
});

module.exports = router;