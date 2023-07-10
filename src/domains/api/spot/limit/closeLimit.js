const express = require("express");
const { getLimitOrder } = require("../queries");
const router = express.Router();

router.get("/close/:id", async (req, res) => {
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

    let newAccountBalance = wallet.balance;
    let newCryptocurrencyBalance = wallet.spotBalance;

    if(order.type == 'buy'){
      newAccountBalance = wallet.balance + order.price * order.quantity;
    }else{
      let cryptoQuantity = Number(wallet.spotBalance[order.pair]) + Number(order.quantity);
      cryptoQuantity = cryptoQuantity.toFixed(1)
      newCryptocurrencyBalance[order.pair] = cryptoQuantity;
    }

    const closeOrder = await closeLimitOrder(req.params.id, req.user.id, newAccountBalance, newCryptocurrencyBalance);

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