const numberOfDecimalPlaces = require("../../../util/numberOfDecimalPlaces");

const futuresPairs = ["ETHUSDT", "BTCUSDT"];

const validateData = (data, pairPrice) => {
  
  if(!futuresPairs.includes(data.pair)){
    return 2;
  }

  const decimalPlaces = numberOfDecimalPlaces(data.quantity);

  if(decimalPlaces > 1 || data.quantity <= 0){
    return 3;
  }
  else if(data.type != "LONG" && data.type != "SHORT"){
    return 4
  }
  else if(data.stopLoss > pairPrice){
    return 5
  }
  else if(data.takeprofit < pairPrice){
    return 6
  }

  return false;
}

module.exports = {validateData}