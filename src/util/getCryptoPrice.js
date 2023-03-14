const { queryCryptoPrices, queryLiquidation } = require('./queries');
const WebSocket = require('ws');
//const WebSocket = require("socket.io-client");

const getCryptoPrices = async () =>{

  const ws = new WebSocket('wss://stream.binance.com:9443/ws');

  ws.on('error', console.error);
  
  ws.on('open', function open() {
    ws.send(JSON.stringify({
      "method": "SUBSCRIBE",
      "params":
      [
      "btcusdt@ticker", "ethusdt@ticker"
      ],
      "id": 1
    }))
  });
  
let object = {}

  ws.on('message', function message(data) {
    let test = data.toString()
    test = JSON.parse(test)
    if(test.e){
      object[test.s] = test.c
    }
    
  });

  setTimeout(async function run(){
    const query = queryCryptoPrices(JSON.stringify(object));
    const keys = Object.keys(object);
    for (const key of keys) {
      //console.log(key)
      const liquidation = await queryLiquidation(key, object[key]);
      //console.log(liquidation)
      
    }
    setTimeout(run, 2000)
  }, 2000);
}

module.exports = getCryptoPrices;