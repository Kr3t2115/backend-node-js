const express = require("express");
const getPairPrice = require("../../../../services/getSpotPairPrice");
const getUserWallet = require("../../../../services/getUserWallet");
const numberOfDecimalPlaces = require('../../../../util/numberOfDecimalPlaces')
const { getPostition, insertLimitOrder, updatePosition} = require("../queries");
const router = express.Router();


/**
 * POST /api/spot/market/sell/:pair
 * @summary Sell cryptocurrencies
 * @tags spot
 * @param {string} pair.required - Cryptocurrencies pair
 * @param {string} quantity.required - Cryptocurrencies quantity
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "success_message": "The sale was carried out correctly",
 *  "sold_pair": "ETHUSDT",
 *  "sold_quantity": 1.3,
*   "sold_amount": 1843.21
 * }
 * @return {object} 404 - failed response - application/json
 * @example response - 400 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 100
 * }
 */ 
// selling cryptocurrency route, takes the name of the pair as an argument
router.post("/sell/:pair", async (req, res) => {
  try {
    // function that returns the current price of the pair
    const pairPrice = await getPairPrice(req.params.pair);
    if (!pairPrice){
      res.status(404).json({
        "error_message": "There is a problem with the specified cryptocurrency pair",
        "error_code": 109
      });
      return;
    }

    const price = req.body.price;

    if(price <= pairPrice){
      res.status(404).json({
        "error_message": "There is a problem with the specified price to make order",
        "error_code": 109
      });
      return;
    }

    // function that returns the number of decimals in the number of cryptocurrencies that the user is interested in buying
    const decimalPlaces = numberOfDecimalPlaces(req.body.quantity)

    // checking whether the user has provided the amount of cryptocurrency he wants to buy
    if(!req.body.quantity || req.body.quantity <= 0 || decimalPlaces > 1){
      res.status(404).json({
        "error_message": "There was a problem with the specified amount to sell cryptocurrencies.",
        "error_code": 112
      });
      return;
    }
    
    // function that returns the current user account wallet information
    const wallet = await getUserWallet(req.user.id);

    // declaring the amount of purchased cryptocurrencies, because the subsequent reference of the object prevents us from reading this value
    const pairQuantity = wallet.spotBalance[req.params.pair];

    if(!wallet.spotBalance?.[req.params.pair] || pairQuantity < req.body.quantity){
      res.status(404).json({
        "error_message": "You do not own as much cryptocurrency as you want to sell.",
        "error_code": 113
      });
      return;
    }
    
    // calculation of a new account balance, and declaration of a cryptocurrency balance object
    const newAccountBalance = wallet.balance;
    let newCryptocurrencyBalance = wallet.spotBalance;
    
    let cryptoQuantity = Number(pairQuantity) - Number(req.body.quantity);
    cryptoQuantity = cryptoQuantity.toFixed(1)
    newCryptocurrencyBalance[req.params.pair] = cryptoQuantity;
    
    // query from the database containing information about the contained item
    const userPosition = await getPostition(
      req.params.pair, 
      req.user.id
    );

    let newPositionData;

    // check whether position should be deleted or reduced
    newPositionData = await insertLimitOrder(
      req.params.pair,
      req.body.quantity, 
      price,
      req.user.id,
      'sell',
      newAccountBalance,
      newCryptocurrencyBalance
    )

    if(!newPositionData){
      res.status(404).json({
        "error_message": "There was a problem updating your position data",
        "error_code": 114
      });
      return;
    }

    res.status(200).json({
      "success_message": "The sale was carried out correctly",
      "sold_pair": req.params.pair,
      "sold_quantity": req.body.quantity,
      "sold_amount": pairPrice * req.body.quantity
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
});

module.exports = router;