const express = require("express");
const getPairPrice = require("../../../../services/getSpotPairPrice");
const getUserWallet = require("../../../../services/getUserWallet");
const numberOfDecimalPlaces = require('../../../../util/numberOfDecimalPlaces')
const { insertLimitOrder, getLimitOrder, closeLimitOrder } = require('../queries');
const router = express.Router();

/**
 * POST /api/spot/market/buy/:pair
 * @summary Buy cryptocurrencies
 * @tags spot
 * @param {string} pair.required - Cryptocurrencies pair
 * @param {string} quantity.required - Cryptocurrencies quantity
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "success_message": "The purchase was carried out correctly",
 *  "purchase_pair": "ETHUSDT",
 *  "purchase_quantity": 1.3,
*   "purchase_amount": 1843.21
 * }
 * @return {object} 404 - failed response - application/json
 * @example response - 400 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 100
 * }
 */ 
// buying cryptocurrency route, takes the name of the pair as an argument
router.post("/buy/:pair", async (req, res) => {
  try {
    // function that returns the number of decimals in the number of cryptocurrencies that the user is interested in buying
    const decimalPlaces = numberOfDecimalPlaces(req.body.quantity);

    // checking whether the user has provided the amount of cryptocurrency he wants to buy
    if(!req.body.quantity || decimalPlaces > 1 || req.body.quantity < 0){
      res.status(404).json({
        "error_message": "There was a problem with the specified amount to buy cryptocurrencies.",
        "error_code": 108
      });
      return;
    }
    
    // function that returns the current price of the pair
    const pairPrice = await getPairPrice(req.params.pair);
    const price = req.body.price;
    if (!pairPrice){
      res.status(404).json({
        "error_message": "There is a problem with the specified cryptocurrency pair",
        "error_code": 109
      });
      return;
    }

    if(price >= pairPrice){
      res.status(404).json({
        "error_message": "There is a problem with the specified price to make order",
        "error_code": 109
      });
      return;
    }

    // function that returns the current user account wallet information
    const wallet = await getUserWallet(req.user.id);

    // checking whether the user can afford this purchase
    if(pairPrice * req.body.quantity > wallet.balance){
      res.status(404).json({
        "error_message": "There was a problem with the purchase of cryptocurrencies, you cannot afford to buy the amount",
        "error_code": 110
      });
      return;
    }

    // calculation of a new account balance, and declaration of a cryptocurrency balance object
    const newAccountBalance = wallet.balance - price * req.body.quantity;
    let position;
    let newCryptocurrencyBalance = wallet.spotBalance;

    if(wallet.spotBalance == null){
        newCryptocurrencyBalance = {};
    }


    // conditional statement checks if this account has any cryptocurrencies in the spot account, on this basis it creates a new object
    
    // res.status(200).send(newCryptocurrencyBalance);
    // return;
    
    
    position = await insertLimitOrder(
      req.params.pair,
      req.body.quantity, 
      price,
      req.user.id,
      'buy',
      newAccountBalance,
      newCryptocurrencyBalance
    )
  

    if(!position){
      res.status(404).json({
        "error_message": "There was a problem with adding your position",
        "error_code": 111
      });
      return;
    }

    res.status(200).json({
      "success_message": "The purchase was carried out correctly",
      "purchased_pair": req.params.pair,
      "purchased_quantity": req.body.quantity,
      "purchase amount": pairPrice * req.body.quantity
    });
    
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
});

router.get("/buy/close/:id", async (req, res) => {
  try {
    const order = await getLimitOrder(req.params.id, req.user.id);    

    if(!order){
      res.status(404).json({
        "error_message": "There was a problem with finding an order with the given id",
        "error_code": 110
      });
      return;
    }

    const wallet = await getUserWallet(req.user.id);

    const newAccountBalance = wallet.balance + order.price;
    const closeOrder = await closeLimitOrder(req.params.id, req.user.id, newAccountBalance);

    if(!closeOrder){
      res.status(404).json({
        "error_message": "There was a problem closing the order",
        "error_code": 110
      });
      return;
    }

    res.status(200).json({
      "success_message": "The close limit order was carried out correctly",
      "id": req.params.id,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
})

module.exports = router;