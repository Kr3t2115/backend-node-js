const pool = require('../config/db');

const closePosition = async (id, pair, closePrice, type, quantity, leverage, purchasePrice, userId) => {
  
  const wallet = await queryUserBalance(userId);

  let profit;

  if(type == "LONG"){
    profit = closePrice * quantity * leverage - purchasePrice * quantity * leverage;
  }else{
    profit = purchasePrice * quantity * leverage - closePrice * quantity * leverage;
  }

  const newAccountBalance = wallet.balance + (purchasePrice * quantity + profit);

  let newFuturesBalance = wallet.futureBalance;

  let futuresQuantity = Number(newFuturesBalance[pair]) - Number(quantity);
  futuresQuantity = futuresQuantity.toFixed(1);

  newFuturesBalance[pair] = futuresQuantity;

  console.log(newFuturesBalance);
}

const queryUserBalance = async (userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM wallet WHERE \"userId\"='${userId}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  }
}

module.exports = closePosition;