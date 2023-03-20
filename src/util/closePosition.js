const pool = require('../config/db');
const getUserWallet = require('../services/getUserWallet');

const closePosition = async (id, pair, closePrice, type, quantity, leverage, purchasePrice, userId) => {
  
  const wallet = await getUserWallet(userId);

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

  updateBalance = await deletePosition(
    id, 
    userId, 
    newAccountBalance, 
    JSON.stringify(newFuturesBalance)
  );

  console.log(newFuturesBalance);
}

const deletePosition = async(id, userId, newAccountBalance, newFutureBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM futures_positions 
      WHERE "id" = $1 AND "userId" = $2;`,
      values: [id, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1, "futureBalance" = $2 
      WHERE "userId" = $3;`,
      values: [newAccountBalance, newFutureBalance, userId]
    });

    await pool.query('COMMIT');
  } catch (error) {
    console.log(error)
    return false;
  }
  return true;
}

module.exports = closePosition;