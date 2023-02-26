const express = require("express");
const {numberOfDecimalPlaces, priceAveraging} = require("./controller");
const {queryUserBalance, queryPairPrice, updateWallet, insertPosition, queryPostition, deletePosition, updatePosition, insertHistoricTrade} = require("./queries");
const router = express.Router();

// declaration of cryptocurrency pairs that are accepted
const spotPairs = ["ETHUSDT", "BTCUSDT"];

// user spot balance route, returns the current spot account balance
router.get("/balance", async (req, res) => {
  const cryptoBalance = await queryUserBalance(req.user.id);

  res.status(200).json(
    cryptoBalance.spotbalance
  );
});

// user spot balance route, returns the current spot account balance for requested pair
router.get("/balance/:pair", async (req, res) => {
  const cryptoBalance = await queryUserBalance(req.user.id);
  
  res.status(200).json({
    [req.params.pair]: cryptoBalance.spotbalance[req.params.pair]
  });
});

// buying cryptocurrency route, takes the name of the pair as an argument
router.post("/market/buy/:pair", async (req, res) => {
  try {
    // checking if the given pair is accepted
    if(!spotPairs.includes(req.params.pair)){
      res.status(404).json({
        "error_message": "There was a problem with the given pair of cryptocurrencies. No pair found.",
        "error_code": 999
      });
      return;
    }

    // function that returns the number of decimals in the number of cryptocurrencies that the user is interested in buying
    const decimalPlaces = numberOfDecimalPlaces(req.body.quantity);

    // checking whether the user has provided the amount of cryptocurrency he wants to buy
    if(!req.body.quantity || decimalPlaces > 1){
      res.status(404).json({
        "error_message": "There was a problem with the specified amount to buy cryptocurrencies.",
        "error_code": 999
      });
      return;
    }
    
    // function that returns the current price of the pair
    const pairPrice = await queryPairPrice(req.params.pair);
    if (!pairPrice){
      res.status(404).json({
        "error_message": "There is a problem with the specified cryptocurrency pair",
        "error_code": 999
      });
      return;
    }

    // function that returns the current user account wallet information
    const userWallet = await queryUserBalance(req.user.id);

    // checking whether the user can afford this purchase
    if(pairPrice * req.body.quantity > userWallet.balance){
      res.status(404).json({
        "error_message": "There was a problem with the purchase of cryptocurrencies, you cannot afford to buy the amount",
        "error_code": 999
      });
      return;
    }

    // calculation of a new account balance, and declaration of a cryptocurrency balance object
    const newAccountBalance = userWallet.balance - pairPrice * req.body.quantity;
    let newCryptocurrencyBalance = userWallet.spotbalance;

    let position;

    // conditional statement checks if this account has any cryptocurrencies in the spot account, on this basis it creates a new object
    if(!userWallet.spotbalance?.[req.params.pair]){
      newCryptocurrencyBalance = {};
      newCryptocurrencyBalance[req.params.pair] = req.body.quantity;
      
      // the function that adds an position to the database, accepts the pair name, quantity, purchase price and user id
      position = await insertPosition(req.params.pair, req.body.quantity, pairPrice, req.user.id);
    }else{
      newCryptocurrencyBalance[req.params.pair] = req.body.quantity + userWallet.spotbalance[req.params.pair];
      
      // function that calculates the average purchase price of cryptocurrencies based on quantity and price
      newAveragePrice = await priceAveraging(req, pairPrice);

      position = await updatePosition(newCryptocurrencyBalance[req.params.pair], newAveragePrice, req.params.pair, req.user.id);
    }

    if(!position){
      res.status(404).json({
        "error_message": "There was a problem with adding your position",
        "error_code": 999
      });
      return;
    }

    // function that updates the state of the user's wallet, accept new account balance, new crypto balance and user id
    const walletUpdated = await updateWallet(newAccountBalance, JSON.stringify(newCryptocurrencyBalance), req.user.id);

    if(!walletUpdated){
      res.status(404).json({
        "error_message": "There was a problem updating your wallet",
        "error_code": 999
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
  }
});

// selling cryptocurrency route, takes the name of the pair as an argument
router.post("/market/sell/:pair", async (req, res) => {
  try {
    //checking if the given pair is accepted
    if(!spotPairs.includes(req.params.pair)){
      res.status(404).json({
        "error_message": "There was a problem with the given pair of cryptocurrencies. No pair found.",
        "error_code": 999
      })
      return;
    }

    // function that returns the number of decimals in the number of cryptocurrencies that the user is interested in buying
    const decimalPlaces = numberOfDecimalPlaces(req.body.quantity)

    // checking whether the user has provided the amount of cryptocurrency he wants to buy
    if(!req.body.quantity || req.body.quantity <= 0 || decimalPlaces > 1){
      res.status(404).json({
        "error_message": "There was a problem with the specified amount to sell cryptocurrencies.",
        "error_code": 999
      });
      return;
    }
    
    // function that returns the current user account wallet information
    const userWallet = await queryUserBalance(req.user.id);

    // declaring the amount of purchased cryptocurrencies, because the subsequent reference of the object prevents us from reading this value
    const pairQuantity = userWallet.spotbalance[req.params.pair];

    if(!userWallet.spotbalance?.[req.params.pair] || pairQuantity < req.body.quantity){
      res.status(404).json({
        "error_message": "You do not own as much cryptocurrency as you want to sell.",
        "error_code": 999
      });
      return;
    }

    // function that returns the current price of the pair
    const pairPrice = await queryPairPrice(req.params.pair);
    
    // calculation of a new account balance, and declaration of a cryptocurrency balance object
    const newAccountBalance = userWallet.balance + pairPrice * req.body.quantity;
    let newCryptocurrencyBalance = userWallet.spotbalance;
    
    newCryptocurrencyBalance[req.params.pair] = pairQuantity - req.body.quantity;
    
    // query from the database containing information about the contained item
    const userPosition = await queryPostition(req.params.pair, req.user.id)
    
    let newPositionData;

    // check whether position should be deleted or reduced
    if (req.body.quantity == pairQuantity) {
      newPositionData = await deletePosition(req.params.pair, req.user.id);
    } else {
      newPositionData = await updatePosition(newCryptocurrencyBalance[req.params.pair], userPosition.purchase_price, req.params.pair, req.user.id);
    }

    if(!newPositionData){
      res.status(404).json({
        "error_message": "There was a problem updating your position data",
        "error_code": 999
      });
      return;
    }

    // adding a trade to history
    const newTradeHistory = await insertHistoricTrade(req.params.pair, req.body.quantity, userPosition.purchase_price, pairPrice, req.user.id);

    if(!newTradeHistory){
      res.status(404).json({
        "error_message": "There was a problem updating your history of positions",
        "error_code": 999
      });
      return;
    }

    // function that updates the state of the user's wallet, accepts new account balance, new crypto balance and user id
    const walletUpdated = await updateWallet(newAccountBalance, JSON.stringify(newCryptocurrencyBalance), req.user.id);

    if(!walletUpdated){
      res.status(404).json({
        "error_message": "There was a problem updating your wallet",
        "error_code": 999
      });
      return;
    }

    res.status(200).json({
      "success_message": "The sele was carried out correctly",
      "purchased_pair": req.params.pair,
      "purchased_quantity": req.body.quantity,
      "purchase amount": pairPrice * req.body.quantity
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;