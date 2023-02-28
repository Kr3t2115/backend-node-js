const numberOfDecimalPlaces = require("../../../util/numberOfDecimalPlaces");

const futuresPairs = ["ETHUSDT", "BTCUSDT"];

const validateData = (data) => {
  
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

  return false;
}

module.exports = {validateData}