const pool = require('../config/db');
const getUserWallet = require('../services/getUserWallet');

// function closing the position at takeprofit, stoploss and liquidation price
const closePosition = async (id, pair, closePrice, type, quantity, leverage, purchasePrice, userId) => {
  
  const wallet = await getUserWallet(userId);

  let profit;

  if(type == "LONG"){
    profit = closePrice * quantity * leverage - (purchasePrice * quantity * leverage);
    newFuturesTypeBalance = wallet.futureBalance.long;
  }else{
    profit = purchasePrice * quantity * leverage - (closePrice * quantity * leverage);
    newFuturesTypeBalance = wallet.futureBalance.short;
  }

  const newAccountBalance = wallet.balance + (purchasePrice * quantity + profit);

  let newFuturesBalance = wallet.futureBalance;

  let futuresQuantity = Number(newFuturesTypeBalance[pair]) - Number(quantity);
  futuresQuantity = futuresQuantity.toFixed(1);

  newFuturesTypeBalance[pair] = futuresQuantity;

  if(type == "LONG"){
    newFuturesBalance.long = newFuturesTypeBalance;
  }else{
    newFuturesBalance.short = newFuturesTypeBalance;
  }

  updateBalance = await deletePosition(
    id, 
    userId, 
    newAccountBalance, 
    JSON.stringify(newFuturesBalance),
    pair,
    quantity,
    leverage,
    purchasePrice,
    closePrice,
    type
  );

  console.log(newFuturesBalance);
}

// query to delete position
const deletePosition = async(id, userId, newAccountBalance, newFutureBalance, pair, quantity, leverage, purchasePrice, closePrice, type) => {
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
      text: `INSERT INTO 
      futures_history ("pair", "quantityPosition", "quantitySold", "leverage", "purchasePrice", "sellingPrice", "userId", "type") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      values: [pair, quantity, quantity, leverage, purchasePrice, closePrice, userId, type]
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
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
  return true;
}

module.exports = closePosition;