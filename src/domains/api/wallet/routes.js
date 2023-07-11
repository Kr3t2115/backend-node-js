const express = require("express");
const getUserWallet = require("../../../services/getUserWallet");
const { getFuturesPositions, getSpotPrices, getFuturesPrices, getLimitSpot, getLimitFutures } = require("./queries");
const router = express.Router();


/**
 * GET /api/wallet/balance
 * @summary User wallet route
 * @tags wallet
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "currentBalance": 1500,
 *  "spotBalance":{"ETHUSDT": 1.2},
 *  "futureBalance": {"BTCUSDT": 0.2}
 * }
 * @return {object} 404 - failed response - application/json
 * @example response - 404 - example failed response
 * {
 *  "error_message": "failed message",
 *  "error_code": 101
 * }
 */ 
// user balance route, returns the current account balance
router.get("/balance", async (req, res) => {
  // function returning current account balance, accepts user id from jwt payload
  const walletInfo = await getUserWallet(req.user.id);

  if(!walletInfo){
    res.status(404).json({
      "error_message": "There was no known issue, no wallet was found for this account",
      "error_code": 101
    });
    return;
  }

  res.status(200).json({
    "currentBalance": walletInfo.balance,
    "spotBalance": walletInfo.spotBalance,
    "futureBalance": walletInfo.futureBalance
  });
});

router.get("/predicted", async (req, res) => {
  try {
    const wallet = await getUserWallet(req.user.id);
    const positions = await getFuturesPositions(req.user.id);
    const keys = Object.keys(wallet.spotBalance);
    const spotPrices = await getSpotPrices();
    const futuresPrices = await getFuturesPrices();

    let predictedBalance = 0;
    predictedBalance += wallet.balance   
 
    for (const key of keys) {
      predictedBalance += Number(wallet.spotBalance[key] * spotPrices[key])
    }
    
    for(x = 0; positions.length > x; x++){
      if(positions[x].type == "LONG"){
        predictedBalance += positions[x].quantity * positions[x].purchasePrice + (futuresPrices[positions[x].pair] - positions[x].purchasePrice) * positions[x].leverage * positions[x].quantity
      }else{
        predictedBalance += positions[x].quantity * positions[x].purchasePrice + (positions[x].purchasePrice - futuresPrices[positions[x].pair]) * positions[x].leverage * positions[x].quantity
      }
    }
    
     
    const limitSpot = await getLimitSpot(req.user.id)

    for(y = 0; limitSpot.length > y; y++){
      if(limitSpot[y].type == "buy"){
        predictedBalance += limitSpot[y].price * limitSpot[y].quantity
      }else{
        predictedBalance += spotPrices[limitSpot[y].pair] * limitSpot[y].quantity
      }
    }
    

    const limitFutures = await getLimitFutures(req.user.id)

    for(z = 0; limitFutures.length > z; z++){
      predictedBalance += limitFutures[z].price * limitFutures[z].quantity
    }

    res.status(200).json({
      'predictedBalance': predictedBalance
    })
  } catch (error) {
    console.log(error);
    res.status(404).json({
      "error": "An unexpected error occurred"
    });
  }
})

module.exports = router;