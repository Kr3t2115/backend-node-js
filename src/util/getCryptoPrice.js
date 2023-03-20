const { queryCryptoPrices, queryLiquidation } = require('./queries');
const {WebSocket, WebSocketServer} = require('ws');

//const WebSocket = require("socket.io-client");

const getCryptoPrices = async () =>{

  const wsss = new WebSocket('wss://stream.binance.com:9443/ws');

  wsss.on('error', console.error);
  
  wsss.on('open', function open() {
    wsss.send(JSON.stringify({
      "method": "SUBSCRIBE",
      "params":
      [
      "btcusdt@ticker", "ethusdt@ticker", "bnbusdt@ticker", "etcusdt@ticker", "dogeusdt@ticker", "xrpusdt@ticker", "linkusdt@ticker"
      ],
      "id": 1
    }))
  });
  
let object = {}
let objectData = {}

  wsss.on('message', function message(data) {
    let test = data.toString()
    test = JSON.parse(test)
    if(test.e){
      object[test.s] = test.c
      objectData[test.s] = {
        "openPrice": test.o,
        "lastPrice": test.c,
        "highPrice": test.h,
        "percentChange": test.P
      }
    }
    
  });

  const wss = new WebSocketServer({ port: 8080 });
  
  wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
  
    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });
  
    ws.send(JSON.stringify(objectData));

    setInterval(() => {
      ws.send(JSON.stringify(objectData));
    }, 5000);

  });

  setTimeout(async function run(){
    const query = queryCryptoPrices(JSON.stringify(object));
    const keys = Object.keys(object);
    for (const key of keys) {
      await queryLiquidation(key, object[key]);
    }
    setTimeout(run, 2000)
  }, 2000);
}

module.exports = getCryptoPrices;