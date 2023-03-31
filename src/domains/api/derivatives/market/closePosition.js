const express = require("express");
const { deletePosition, updatePosition, getPosition } = require("../queries");
const numberOfDecimalPlaces = require('../../../../util/numberOfDecimalPlaces');
const getPairPrice = require("../../../../services/getFuturesPairPrice");
const getUserWallet = require("../../../../services/getUserWallet");
const router = express.Router();

/**
 * POST /api/derivatives/market/close/:id
 * @summary Cryptocurrencies futures update position
 * @tags futures
 * @param {number} id.required - Cryptocurrencies pair
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
    {
      "success": "the position has been closed successfully"
    }
    * @return {object} 404 - success response - application/json
    * @example response - 404 - example success response
    {
      "error_message": "Your position is not as big as you want to sell",
      "error_code": 106
    }
    */

// route responsible for closing futures positions
router.post("/close/:id", async(req, res) => {
  try {
    // function that returns the number of decimal places
    const decimalPlaces = numberOfDecimalPlaces(req.body.quantity)

    // checking if the given amount is correct
    if(!req.body.quantity || decimalPlaces > 1 || req.body.quantity < 0){
      res.status(404).json({
        "error_message": "There was a problem with the specified amount of cryptocurrencies",
        "error_code": 104
      });
      return; 
    }

    // function that returns position data from the database
    const position = await getPosition(
      req.params.id, 
      req.user.id
    );

    if(!position){
      res.status(404).json({
        "error_message": "There was a problem retrieving position from the database",
        "error_code": 105
      });
      return; 
    }

    // checking if the user has as many cryptocurrencies as he wants to sell
    if(req.body.quantity > position.quantity){
      res.status(404).json({
        "error_message": "Your position is not as big as you want to sell",
        "error_code": 106
      });
      return; 
    }

    // function that returns the current price of the pair
    const pairPrice = await getPairPrice(position.pair);

    if(!pairPrice){
      res.status(404).json({
        "error_message": "here is a problem with the cryptocurrency pair you provided",
        "error_code": 100 
      });
      return; 
    }

    // function returning information about the user's wallet, if there is any problem it will return false
    const wallet = await getUserWallet(req.user.id)
    
    if(!wallet){
      res.status(404).json({
        "error_message": "There was a problem retrieving the user's wallet",
        "error_code": 101
      });
      return; 
    }

    // calculation of the profit depending on the type of position
    let profit;

    if(position.type == "LONG"){
      profit = pairPrice * req.body.quantity * position.leverage - position.purchasePrice * req.body.quantity * position.leverage;
    }else{
      profit = position.purchasePrice * req.body.quantity * position.leverage - pairPrice * req.body.quantity * position.leverage;
    }

    // calculation of a new account balance
    const newAccountBalance = wallet.balance + (position.purchasePrice * req.body.quantity + profit);

    // calculation of the new balance of futures cryptocurrency

    let newFuturesTypeBalance = wallet.futureBalance;
    let newFuturesBalance = wallet.futureBalance;

    if(position.type == "LONG"){
      newFuturesTypeBalance = newFuturesBalance.long;
    }else{
      newFuturesTypeBalance = newFuturesBalance.short;
    }

    let futuresQuantity = Number(newFuturesTypeBalance[position.pair]) - Number(req.body.quantity);
    futuresQuantity = futuresQuantity.toFixed(1);

    newFuturesTypeBalance[position.pair] = futuresQuantity;

    if(position.type == "LONG"){
      newFuturesBalance.long = newFuturesTypeBalance;
    }else{
      newFuturesBalance.short = newFuturesTypeBalance;
    }

    let updateBalance;

    // deleting or updating position depending on the desired quantity to sell
    if(position.quantity == req.body.quantity){
      updateBalance = await deletePosition(
        req.params.id, 
        req.user.id, 
        newAccountBalance, 
        JSON.stringify(newFuturesBalance), 
        position.pair, position.quantity, 
        req.body.quantity, 
        position.leverage, 
        position.purchasePrice, 
        pairPrice
      );
    }else{
      let quantity = Number(position.quantity) - Number(req.body.quantity);
      quantity = quantity.toFixed(1);

      updateBalance = await updatePosition(
        quantity, 
        req.params.id,
        req.user.id, 
        newAccountBalance, 
        JSON.stringify(newFuturesBalance), 
        position.pair, position.quantity, 
        req.body.quantity, position.leverage, 
        position.purchasePrice, 
        pairPrice
      );
    }
   
    if(!updateBalance){
      res.status(404).json({
        "error_message": "There was a problem updating the position",
        "error_code": 107
      });
      return; 
    }

    res.status(200).json({
      "success": "the position has been closed successfully"
    });
  } catch (error) {
    console.log(error)
    res.status(404).json({
      "error": "An unexpected error occurred"
    })
  }
});

module.exports = router;