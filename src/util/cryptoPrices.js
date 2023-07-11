const { queryCryptoPrices, queryLiquidation, querySpotLimit, queryFuturesLimit, queryAllWallets, getLimitSpot, queryPositions, getLimitFutures } = require('./queries');
const {WebSocket, WebSocketServer} = require('ws');
const express = require("express");
const router = express.Router();

let pairFuturesPrices = {}
let cryptoFuturesData = {}
let pairSpotPrices = {}
let cryptoSpotData = {}

router.get("/", (req, res) => {
    res.status(200).json({spot: cryptoSpotData, futures: cryptoFuturesData})
})

const cryptoPrices = async () =>{

  const wsFuturesBinance = new WebSocket('wss://fstream.binance.com/ws');

  wsFuturesBinance.on('error', console.error);
  
  wsFuturesBinance.on('open', function open() {
    wsFuturesBinance.send(JSON.stringify({
      "method": "SUBSCRIBE",
      "params":
      [
      "btcusdt@ticker", "ethusdt@ticker", "bnbusdt@ticker", "etcusdt@ticker", "dogeusdt@ticker", "xrpusdt@ticker", "linkusdt@ticker", "solusdt@ticker", "dotusdt@ticker", "ltcusdt@ticker", "arbusdt@ticker", "galusdt@ticker"
      ],
      "id": 1
    }))
  });
  
  

  // creating objects based on the response from the binance api
  wsFuturesBinance.on('message', function message(data) {
      let futuresData = data.toString()
      futuresData = JSON.parse(futuresData)
      if(futuresData.e){
        pairFuturesPrices[futuresData.s] = futuresData.c
        cryptoFuturesData[futuresData.s] = {
          "pair": futuresData.s,
          "openPrice": futuresData.o,
          "lastPrice": futuresData.c,
          "highPrice": futuresData.h,
          "lowPrice": futuresData.l,
          "priceChange": futuresData.p,
          "percentChange": futuresData.P,
          "volume": futuresData.q
        }
      }
    });

  const wsSpotBinance = new WebSocket('wss://stream.binance.com:9443/ws');

  wsSpotBinance.on('error', console.error);
  
  wsSpotBinance.on('open', function open() {
    wsSpotBinance.send(JSON.stringify({
      "method": "SUBSCRIBE",
      "params":
      [
      "btcusdt@ticker", "ethusdt@ticker", "bnbusdt@ticker", "etcusdt@ticker", "dogeusdt@ticker", "xrpusdt@ticker", "linkusdt@ticker", "solusdt@ticker", "dotusdt@ticker", "ltcusdt@ticker", "arbusdt@ticker", "galusdt@ticker"
      ],
      "id": 1
    }))
  });
  


  // creating objects based on the response from the binance api
  wsSpotBinance.on('message', function message(data) {
      let spotData = data.toString()
      spotData = JSON.parse(spotData)
      if(spotData.e){
        pairSpotPrices[spotData.s] = spotData.c
        cryptoSpotData[spotData.s] = {
          "pair": spotData.s,
          "openPrice": spotData.o,
          "lastPrice": spotData.c,
          "highPrice": spotData.h,
          "lowPrice": spotData.l,
          "priceChange": spotData.p,
          "percentChange": spotData.P,
          "volume": spotData.q
        }
      }
    });

  // creating a websocket server that will send basic data about cryptocurrencies to the frontend
  const wsServer = new WebSocketServer({ port: 8081 });

  wsServer.on('connection', function connection(ws) {
    ws.on('error', console.error);
  
    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });
  
    ws.send(JSON.stringify({spot: cryptoSpotData, futures: cryptoFuturesData}));

    setInterval(() => {
      ws.send(JSON.stringify({spot: cryptoSpotData, futures: cryptoFuturesData}));
    }, 2000);

  });

  setInterval(async () => {
    const keys = Object.keys(pairFuturesPrices);
    const wallets = await queryAllWallets();
    for(i = 0; wallets.length > i; i++){
      const positions = await queryPositions(wallets[i].userId);
      let predictedBalance = 0;
      predictedBalance += wallets[i].balance

      for (const key of keys) {
        if(wallets[i].spotBalance[key]){
          predictedBalance += Number(wallets[i].spotBalance[key] * pairSpotPrices[key])
        }
      }

      for(x = 0; positions.length > x; x++){
        if(positions[x].type == "LONG"){
          predictedBalance += positions[x].quantity * positions[x].purchasePrice + (pairFuturesPrices[positions[x].pair] - positions[x].purchasePrice) * positions[x].leverage * positions[x].quantity
        }else{
          predictedBalance += positions[x].quantity * positions[x].purchasePrice + (positions[x].purchasePrice - pairFuturesPrices[positions[x].pair]) * positions[x].leverage * positions[x].quantity
        }
      }
      
      const limitSpot = await getLimitSpot(wallets[i].userId)

      for(z = 0; limitSpot.length > z; z++){
        if(limitSpot[z].type == "buy"){
          predictedBalance += limitSpot[z].price * limitSpot[z].quantity
        }else{
          predictedBalance += pairSpotPrices[limitSpot[z].pair] * limitSpot[z].quantity
        }
      }

      const limitFutures = await getLimitFutures(wallets[i].userId)

      for(z = 0; limitFutures.length > z; z++){
        predictedBalance += limitFutures[z].price * limitFutures[z].quantity
      }
    }
  }, 4500);

  // function that updates the database and closes positions after take profit, stop loss and liquidation
  setTimeout(async function run(){
    await queryCryptoPrices(JSON.stringify(pairSpotPrices), JSON.stringify(pairFuturesPrices));
    const keys = Object.keys(pairFuturesPrices);
    for (const key of keys) {
      await queryLiquidation(key, pairFuturesPrices[key]);
      await querySpotLimit(key, pairSpotPrices[key]);
      await queryFuturesLimit(key, pairSpotPrices[key]);
    }
    setTimeout(run, 2000)
  }, 2000);
}

module.exports = {cryptoPrices: cryptoPrices, newRouter: router};