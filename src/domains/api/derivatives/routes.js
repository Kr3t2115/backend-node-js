const express = require("express");
const { validateData } = require("./controller");
const { queryPairPrice, queryUserBalance, insertPosition, queryPosition, deletePosition, updatePosition, updateTPSL } = require("./queries");
const numberOfDecimalPlaces = require('../../../util/numberOfDecimalPlaces');
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
    res.s4tatus(40).json({
      "error_message": "There was a problem with validation",
      "error_code": 1001
    });
    return;
  }

  let liquidationPrice;

  if(data.type == "LONG"){
    liquidationPrice = Number(pairPrice) - Number(pairPrice) / Number(data.leverage);
  }else{
    liquidationPrice = Number(pairPrice) + Number(pairPrice) / Number(data.leverage);
  }

  const newAccountBalance = wallet.balance - pairPrice * data.quantity;

  let newFutureBalance = wallet.futureBalance;
  let position;

  if(!wallet.futureBalance?.[req.params.pair] || wallet.futureBalance?.[req.params.pair] == 0){
    newFutureBalance = {};
    newFutureBalance[req.params.pair] = Number(data.quantity).toFixed(1);

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

    const decimalPlaces = numberOfDecimalPlaces(req.body.quantity)

    if(!req.body.quantity || decimalPlaces > 1 || req.body.quantity < 0){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 1001213
      });
      return; 
    }

    const position = await queryPosition(req.params.id, req.user.id);

    if(!position){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 100121
      });
      return; 
    }

    if(req.body.quantity > position.quantity){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 1001211
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
      profit = pairPrice * req.body.quantity * position.leverage - position.purchasePrice * req.body.quantity * position.leverage;
    }else{
      profit = position.purchasePrice * req.body.quantity * position.leverage - pairPrice * req.body.quantity * position.leverage;
    }

    const newAccountBalance = wallet.balance + (position.purchasePrice * req.body.quantity + profit);

    let newFuturesBalance = wallet.futureBalance;

    let futuresQuantity = Number(newFuturesBalance[position.pair]) - Number(req.body.quantity);
    futuresQuantity = futuresQuantity.toFixed(1);

    newFuturesBalance[position.pair] = futuresQuantity;

    let updateBalance;

    if(position.quantity == req.body.quantity){
      updateBalance = await deletePosition(req.params.id, req.user.id, newAccountBalance, JSON.stringify(newFuturesBalance), position.pair, position.quantity, req.body.quantity, position.leverage, position.purchasePrice, pairPrice);
    }else{
      let quantity = Number(position.quantity) - Number(req.body.quantity);
      quantity = quantity.toFixed(1);

      updateBalance = await updatePosition(quantity, req.params.id, req.user.id, newAccountBalance, JSON.stringify(newFuturesBalance), position.pair, position.quantity, req.body.quantity, position.leverage, position.purchasePrice, pairPrice)
    }
   
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

router.post("/position/update/:id", async(req, res) => {
  try {
  
    const data = {
      takeProfit: req.body.takeProfit || null,
      stopLoss: req.body.stopLoss || null
    }

    const position = await queryPosition(req.params.id, req.user.id);
    const pairPrice = await queryPairPrice(position.pair);

    // wrzuc to do kontrolera pozniej
    if(position.type == "LONG"){

      if(data.takeProfit <= pairPrice && data.takeProfit !== null){
        res.status(404).json({
          "error_message": "There was a problem with validation",
          "error_code": 10
        });
        return; 
      }else if(data.stopLoss >= pairPrice && data.stopLoss !== null || data.stopLoss <= position.liquidationPrice){
        res.status(404).json({
          "error_message": "There was a problem with validation",
          "error_code": 11
        });
        return; 
      }

    }else{

      if(data.takeProfit >= pairPrice && data.takeProfit !== null){
        res.status(404).json({
          "error_message": "There was a problem with validation",
          "error_code": 12
        });
        return; 
      }else if(data.stopLoss <= pairPrice && data.stopLoss !== null || data.stopLoss >= position.liquidationPrice){
        res.status(404).json({
          "error_message": "There was a problem with validation",
          "error_code": 13
        });
        return; 
      }
    }

    const updatePosition = await updateTPSL(data.takeProfit, data.stopLoss, req.params.id, req.user.id);

    if(!updatePosition){
      res.status(404).json({
        "error_message": "There was a problem with validation",
        "error_code": 14
      });
      return; 
    }

    res.send(pairPrice)
  } catch (error) {
    console.log(error);
    res.status(404).send("error")
  }
});

module.exports = router;