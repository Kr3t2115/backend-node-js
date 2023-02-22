const express = require("express");
const {queryUserBalance, queryPairPrice, updateWallet} = require("./queries");
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

  res.status(200).json(
    cryptoBalance.spotbalance[req.params.pair]
  );
});

// buying cryptocurrency route, takes the name of the pair as an argument
router.post("/market/buy/:pair", async (req, res) => {
  try {
    //checking if the given pair is accepted
    if(!spotPairs.includes(req.params.pair)){
      res.status(404).json({
        "error_message": "There was a problem with the given pair of cryptocurrencies. No pair found.",
        "error_code": 999
      });
      return;
    }

    // checking whether the user has provided the amount of cryptocurrency he wants to buy
    if(!req.body.quantity){
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

    const newAccountBalance = userWallet.balance - pairPrice * req.body.quantity;
    let newCryptocurrencyBalance = userWallet.spotbalance;

    // conditional statement checks if this account has any cryptocurrencies in the spot account, on this basis it creates a new object
    if(!userWallet.spotbalance?.[req.params.pair]){
      newCryptocurrencyBalance = {};
      newCryptocurrencyBalance[req.params.pair] = req.body.quantity;
    }else{
      newCryptocurrencyBalance[req.params.pair] = req.body.quantity + userWallet.spotbalance[req.params.pair];
    }

    //function that updates the state of the user's wallet
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

    // checking whether the user has provided the amount of cryptocurrency he wants to buy
    if(!req.body.quantity || req.body.quantity <= 0){
      res.status(404).json({
        "error_message": "There was a problem with the specified amount to sell cryptocurrencies.",
        "error_code": 999
      });
      return;
    }
    
    // function that returns the current user account wallet information
    const userWallet = await queryUserBalance(req.user.id);

    if(!userWallet.spotbalance?.[req.params.pair] || userWallet.spotbalance[req.params.pair] < req.body.quantity){
      res.status(404).json({
        "error_message": "You do not own as much cryptocurrency as you want to sell.",
        "error_code": 999
      });
      return;
    }

    // function that returns the current price of the pair
    const pairPrice = await queryPairPrice(req.params.pair);
    
    const newAccountBalance = userWallet.balance + pairPrice * req.body.quantity;
    let newCryptocurrencyBalance = userWallet.spotbalance;

    newCryptocurrencyBalance[req.params.pair] = userWallet.spotbalance[req.params.pair] - req.body.quantity;

    //function that updates the state of the user's wallet
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