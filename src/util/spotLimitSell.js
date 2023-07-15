const getUserWallet = require('../services/getUserWallet');
const moment = require('moment-timezone');
const pool = require('../config/db');

const spotLimitSell = async (id, pair, quantity, price, userId) => {
  const wallet = await getUserWallet(userId);
  
  // let newCryptocurrencyBalance = wallet.spotBalance;
  // newCryptocurrencyBalance[pair] = newCryptocurrencyBalance[pair] - quantity;

  const newAccountBalance = wallet.balance + price * quantity;

  const result = await insertSpotByLimit(
    pair,
    quantity,
    price,
    userId,
    newAccountBalance,
    id
  )
} 

const insertSpotByLimit = async(pair, quantity, price, userId, newAccountBalance, id) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      spot_positions ("pair", "quantity", "purchasePrice", "userId") 
      VALUES ($1, $2, $3, $4);`,
      values: [pair, quantity, price, userId]
    });
    

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1 
      WHERE "userId" = $2;`,
      values: [newAccountBalance, userId]
    });

    const serverTime = moment().tz('Europe/Warsaw');
    const timestamp = serverTime.format('YYYY-MM-DD HH:mm:ss.SSS');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE spot_limit_history 
      SET "status" = $1, "endDate" = $2 
      WHERE "userId" = $3 AND "orderId" = $4;`,
      values: ['filled', timestamp, userId, id]
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      history_spot ("pair", "type", "quantity", "price", "userId") 
      VALUES ($1, 'sell', $2, $3, $4);`,
      values: [pair, quantity, price, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM spot_limit_orders
      WHERE id = $1;`,
      values: [id]
    });

    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
  return true;
}

module.exports = spotLimitSell;