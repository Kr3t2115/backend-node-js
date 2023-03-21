const { queryCryptoPrices, queryLiquidation } = require('./queries');
const {WebSocket, WebSocketServer} = require('ws');

const cryptoPrices = async () =>{

  const wsFuturesBinance = new WebSocket('wss://fstream.binance.com/ws');

  wsFuturesBinance.on('error', console.error);
  
  wsFuturesBinance.on('open', function open() {
    wsFuturesBinance.send(JSON.stringify({
      "method": "SUBSCRIBE",
      "params":
      [
      "btcusdt@ticker", "ethusdt@ticker", "bnbusdt@ticker", "etcusdt@ticker", "dogeusdt@ticker", "xrpusdt@ticker", "linkusdt@ticker"
      ],
      "id": 1
    }))
  });
  
  let pairFuturesPrices = {}
  let cryptoFuturesData = {}

  // creating objects based on the response from the binance api
  wsFuturesBinance.on('message', function message(data) {
      let futuresData = data.toString()
      futuresData = JSON.parse(futuresData)
      if(futuresData.e){
        pairFuturesPrices[futuresData.s] = futuresData.c
        cryptoFuturesData[futuresData.s] = {
          "openPrice": futuresData.o,
          "lastPrice": futuresData.c,
          "highPrice": futuresData.h,
          "percentChange": futuresData.P
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
      "btcusdt@ticker", "ethusdt@ticker", "bnbusdt@ticker", "etcusdt@ticker", "dogeusdt@ticker", "xrpusdt@ticker", "linkusdt@ticker"
      ],
      "id": 1
    }))
  });
  
  let pairSpotPrices = {}
  let cryptoSpotData = {}

  // creating objects based on the response from the binance api
  wsSpotBinance.on('message', function message(data) {
      let spotData = data.toString()
      spotData = JSON.parse(spotData)
      if(spotData.e){
        pairSpotPrices[spotData.s] = spotData.c
        cryptoSpotData[spotData.s] = {
          "openPrice": spotData.o,
          "lastPrice": spotData.c,
          "highPrice": spotData.h,
          "percentChange": spotData.P
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
    }, 5000);

  });

  // function that updates the database and closes positions after take profit, stop loss and liquidation
  setTimeout(async function run(){
    await queryCryptoPrices(JSON.stringify(pairSpotPrices), JSON.stringify(pairFuturesPrices));
    const keys = Object.keys(pairFuturesPrices);
    for (const key of keys) {
      await queryLiquidation(key, pairFuturesPrices[key]);
    }
    setTimeout(run, 2000)
  }, 2000);
}

module.exports = cryptoPrices;