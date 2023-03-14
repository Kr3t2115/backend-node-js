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

  updateBalance = await deletePosition(id, userId, newAccountBalance, JSON.stringify(newFuturesBalance));

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

const deletePosition = async(id, userId, newAccountBalance, newFutureBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM futures_positions WHERE id='${id}' AND \"userId\" = '${userId}';`
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet SET balance='${newAccountBalance}', \"futureBalance\"='${newFutureBalance}' WHERE \"userId\"='${userId}';`
    });

    await pool.query('COMMIT');
  } catch (error) {
    console.log(error)
    return false;
  }
  return true;
}

module.exports = closePosition;