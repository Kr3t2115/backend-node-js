const express = require("express");
const {queryCryptoBalance, queryUserBalance, queryPairPrice, updateWallet} = require("./queries");
const router = express.Router();

const spotPairs = ["ETHUSDT", "BTCUSDT"]

router.get("/balance", async (req, res) => {

  const cryptoBalance = await queryCryptoBalance(req.user.id);

  res.status(200).json(
    cryptoBalance
  )
})

router.post("/market/buy/:pair", async (req, res) => {
  if(!spotPairs.includes(req.params.pair)){
    res.status(404).json({
      "error_message": "There was a problem with the given pair of cryptocurrencies. No pair found.",
      "error_code": 999
    })
  
  }
  if(!req.body.quantity){
    res.status(404).json({
      "error_message": "There was a problem with the specified amount to buy cryptocurrencies.",
      "error_code": 999
    })
    return;
  }

  const pairPrice = await queryPairPrice(req.params.pair)
  const userBalance = await queryUserBalance(req.user.id)

  if(pairPrice * req.body.quantity > userBalance.balance){
    res.status(404).json({
      "error_message": "There was a problem with the purchase of cryptocurrencies, you cannot afford to buy the amount",
      "error_code": 999
    })
    return;
  }

  const newAccountBalance = userBalance.balance - pairPrice * req.body.quantity
  let newCryptocurrencyBalance = userBalance.spotbalance
  newCryptocurrencyBalance[req.params.pair] = req.body.quantity + userBalance.spotbalance[req.params.pair]

  const query = await updateWallet(newAccountBalance, JSON.stringify(newCryptocurrencyBalance), req.user.id)

  res.send("sdadsa")
})



module.exports = router;