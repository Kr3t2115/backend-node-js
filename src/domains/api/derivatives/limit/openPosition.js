const express = require("express");
const { validateData } = require("../controller");
const { insertLimitPosition } = require("../queries");
const getPairPrice = require("../../../../services/getFuturesPairPrice");
const getUserWallet = require("../../../../services/getUserWallet");

const router = express.Router();

// route responsible for opening futures positions
router.post("/open/:pair", async(req, res) => {
  try {
    // declare data object
  const data = {
    // required data
    pair: req.params.pair,
    quantity: req.body.quantity,
    price: req.body.price,
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

  const decimalPlacesPrice = numberOfDecimalPlaces(price)

  if(data.type == 'LONG' && pairPrice <= Number(data.price) || decimalPlacesPrice > 5){
    res.status(404).json({
      "error_message": "Price you entered does not allow you to create a position",
      "error_code": 100
    });
    return;
  }
  if(data.type == 'SHORT' && Number(data.price) <= pairPrice || decimalPlacesPrice > 5){
    res.status(404).json({
      "error_message": "Price you entered does not allow you to create a position",
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
  if(wallet.balance < data.price * data.quantity){
    res.status(404).json({
      "error_message": "There is a problem, the user cannot afford to buy the requested amount of cryptocurrencies",
      "error_code": 102
    });
    return;
  }

  // calculating a new account balance
  const newAccountBalance = wallet.balance - data.price * data.quantity;

  let position;

  // function that adds items to the database returns false if the operation failed
  position = await insertLimitPosition(
    data.pair, 
    data.type,
    data.quantity, 
    data.leverage, 
    data.price, 
    data.takeProfit, 
    data.stopLoss, 
    req.user.id,  
    newAccountBalance, 
  )

  if(!position){
    res.status(404).json({
      "error_message": "There was a problem adding your item to the database",
      "error_code": 103
    });
    return; 
  }

  res.status(200).json({
    "success": "the position has been added successfully"
  });
  } catch (error) {
    console.log(error)
    res.status(404).json({
      "error": "An unexpected error occurred"
    })
  }
});

module.exports = router;