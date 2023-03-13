const numberOfDecimalPlaces = require("../../../util/numberOfDecimalPlaces");

const validateData = (data, pairPrice) => {
  const decimalPlaces = numberOfDecimalPlaces(data.quantity);

  if(decimalPlaces > 1 || data.quantity <= 0){
    return 3;
  }
  else if(data.type != "LONG" && data.type != "SHORT"){
    return 4;
  }
  else if(data.stopLoss > pairPrice){
    return 5;
  }
  else if(data.takeProfit && data.takeProfit < pairPrice){
    return 6;
  }

  return false;
}

module.exports = {validateData}