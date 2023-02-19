const axios = require('axios');
const { queryCryptoPrices } = require('./queries');

const getCryptoPrices = () =>{
  setInterval(() => {
    axios.get('https://www.binance.com/api/v3/ticker/price?symbols=["ETHUSDT","BTCUSDT"]')
      .then(function (response) {
        let test = {}

        for (let i = 0; i < response.data.length; i++) {
          test[response.data[i].symbol] = parseFloat(response.data[i].price)
        }

        const query = queryCryptoPrices(JSON.stringify(test));
        
      })
      .catch(function (error) {
        console.log(error);
      })
    }, 2000);
}

module.exports = getCryptoPrices;