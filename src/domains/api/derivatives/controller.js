const numberOfDecimalPlaces = require("../../../util/numberOfDecimalPlaces");

// validation of data provided when opening a position
const validateData = (data, pairPrice, liquidationPrice) => {

  // function that returns the number of decimal places 
  const decimalPlaces = numberOfDecimalPlaces(data.quantity);

  if(decimalPlaces > 1 || data.quantity <= 0){
    return 200;
  }
  else if(data.type != "LONG" && data.type != "SHORT"){
    return 201;
  }
  else if(data.type == "LONG"){
    if(data.stopLoss > pairPrice || data.stopLoss < liquidationPrice){
      return 202;
    }
    else if(data.takeProfit && data.takeProfit < pairPrice){
      return 203;
    }
  }
  else if(data.type == "SHORT"){
    if(data.stopLoss < pairPrice || data.stopLoss > liquidationPrice){
      return 204;
    }
    else if(data.takeProfit && data.takeProfit > pairPrice){
      return 205;
    }
  } 
  if(!Number.isInteger(data.leverage) || data.leverage < 1 || data.leverage > 50){
    return 206;
  }
  
  return false;
}

// checking if given take profit and stop loss can exist
const validateUpdateData = (position, data, pairPrice) => {
  if(position.type == "LONG"){
    if(data.takeProfit <= pairPrice && data.takeProfit !== null){
      return 207; 
    }else if(data.stopLoss >= pairPrice && data.stopLoss !== null || data.stopLoss <= position.liquidationPrice){
      return 208; 
    }
  }else{
    if(data.takeProfit >= pairPrice && data.takeProfit !== null){
      return 209; 
    }else if(data.stopLoss <= pairPrice && data.stopLoss !== null || data.stopLoss >= position.liquidationPrice){
      return 210; 
    }
  }
}

module.exports = {validateData, validateUpdateData}