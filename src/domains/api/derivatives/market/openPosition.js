const express = require("express");
const { validateData } = require("../controller");
const { insertPosition } = require("../queries");
const getPairPrice = require("../../../../services/getFuturesPairPrice");
const getUserWallet = require("../../../../services/getUserWallet");

const router = express.Router();

/**
 * POST /api/derivatives/market/open/:pair
 * @summary Cryptocurrencies futures update position
 * @tags futures
 * @param {string} pair.required - Cryptocurrencies pair
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
    {
      "success": "the position has been added successfully",
      "id": 131
    }
    * @return {object} 404 - success response - application/json
    * @example response - 404 - example success response
    {
      "error_message": "There is a problem with the cryptocurrency pair you provided",
      "error_code": 100
    }
    */

// route responsible for opening futures positions
router.post("/open/:pair", async(req, res) => {
  try {
    // declare data object
  const data = {
    // required data
    pair: req.params.pair,
    quantity: req.body.quantity,
    type: req.body.type, // Short or long 
    // optional data
    takeProfit: req.body.takeProfit || null,
    stopLoss: req.body.stopLoss || null,
    leverage: req.body.leverage || 1
  }

  // function that returns the current price of the pair
  const pairPrice = await getPairPrice(data.pair);

  if (!pairPrice){
    res.status(404).json({
      "error_message": "There is a problem with the cryptocurrency pair you provided",
      "error_code": 100
    });
    return;
  }

  // calculate liquidation price
  const liquidationPrice = 
    data.type === "LONG"
      ? Number(pairPrice) - Number(pairPrice) / Number(data.leverage)
      : data.leverage > 1 ? Number(pairPrice) + Number(pairPrice) / Number(data.leverage) : Number(pairPrice) * 10;

  // function that returns true if there was a problem verifying the data provided by the user
  const validateError = validateData(
    data, 
    pairPrice, 
    liquidationPrice
  );

  if(validateError){
    res.status(404).json({
      "error_message": "There was a problem validation the data you entered",
      "error_code": validateError
    });
    return;
  }

  // function returning information about the user's wallet, if there is any problem it will return false
  const wallet = await getUserWallet(req.user.id)
  
  if (!wallet){
    res.status(404).json({
      "error_message": "There was a problem retrieving the user's wallet",
      "error_code": 101
    });
    return;
  }

  // checking whether the user can afford to buy the desired amount of cryptocurrencies
  if(wallet.balance < pairPrice * data.quantity){
    res.status(404).json({
      "error_message": "There is a problem, the user cannot afford to buy the requested amount of cryptocurrencies",
      "error_code": 102
    });
    return;
  }

  // calculating a new account balance
  const newAccountBalance = wallet.balance - pairPrice * data.quantity;
  
  

  let newFutureTypeBalance = {}
  let newFutureBalance = wallet.futureBalance;
  let position;

  if(data.type == "LONG"){
    if(wallet.futureBalance?.long){
      newFutureTypeBalance = wallet.futureBalance?.long
    }
  }else{
    if(wallet.futureBalance?.short){
      newFutureTypeBalance = wallet.futureBalance?.short
    } 
  }

  if(!newFutureBalance){
    newFutureBalance = {};
  }
  
  // based on whether the user has a given cryptocurrency in a different way, we calculate his new account balance
  if(!newFutureTypeBalance?.[req.params.pair] || newFutureTypeBalance?.[req.params.pair] == 0){
    newFutureTypeBalance[req.params.pair] = Number(data.quantity).toFixed(1);
  }else{
    const cryptoBalance = Number(data.quantity) + Number(newFutureTypeBalance[req.params.pair]);
    newFutureTypeBalance[req.params.pair] = cryptoBalance.toFixed(1);
  }

  if(data.type == "LONG"){
    newFutureBalance.long = newFutureTypeBalance;
  }else{
    newFutureBalance.short = newFutureTypeBalance;
  }

  // function that adds items to the database returns false if the operation failed
  position = await insertPosition(
    data.pair, 
    data.type,
    data.quantity, 
    data.leverage, 
    pairPrice, 
    data.takeProfit, 
    data.stopLoss, 
    req.user.id, 
    liquidationPrice, 
    newAccountBalance, 
    JSON.stringify(newFutureBalance)
  )

  if(!position){
    res.status(404).json({
      "error_message": "There was a problem adding your item to the database",
      "error_code": 103
    });
    return; 
  }

  res.status(200).json({
    "success": "the position has been added successfully",
    "id": position
  });
  } catch (error) {
    console.log(error)
    res.status(404).json({
      "error": "An unexpected error occurred"
    })
  }
});

module.exports = router;