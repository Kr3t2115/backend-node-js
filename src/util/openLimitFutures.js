const getUserWallet = require('../services/getUserWallet');
const moment = require('moment-timezone');
const pool = require('../config/db');

const openLimitFutures = async (id, pair, type, quantity, price, leverage, takeProfit, stopLoss, userId) => {

  const liquidationPrice = 
    type === "LONG"
    ? Number(price) - Number(price) / Number(leverage)
    : leverage > 1 ? Number(price) + Number(price) / Number(leverage) : Number(price) * 10;

  const wallet = await getUserWallet(userId)
  
  if (!wallet){
    return;
  }

  let newFutureTypeBalance = {}
  let newFutureBalance = wallet.futureBalance;  
  if(type == "LONG"){
    if(wallet.futureBalance?.long){
      newFutureTypeBalance = wallet.futureBalance?.long
    }
  }else{
    if(wallet.futureBalance?.short){
      newFutureTypeBalance = wallet.futureBalance?.short
    } 
  }

  if(!newFutureBalance){
    newFutureBalance = {};
  }
  
  // based on whether the user has a given cryptocurrency in a different way, we calculate his new account balance
  if(!newFutureTypeBalance?.[pair] || newFutureTypeBalance?.[pair] == 0){
    newFutureTypeBalance[pair] = Number(quantity).toFixed(1);
  }else{
    const cryptoBalance = Number(quantity) + Number(newFutureTypeBalance[pair]);
    newFutureTypeBalance[pair] = cryptoBalance.toFixed(1);
  }

  if(type == "LONG"){
    newFutureBalance.long = newFutureTypeBalance;
  }else{
    newFutureBalance.short = newFutureTypeBalance;
  }

  insertPosition(id, pair, type, quantity, leverage, price, takeProfit, stopLoss, userId, liquidationPrice, newFutureBalance)
}

const insertPosition = async(id, pair, type, quantity, leverage, purchasePrice, takeProfit, stopLoss, userId, liquidationPrice, newFutureBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      futures_positions ("pair", "type", "quantity", "leverage", "purchasePrice", "takeProfit", "stopLoss", "userId", "liquidationPrice") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      values: [pair, type, quantity, leverage, purchasePrice, takeProfit, stopLoss, userId, liquidationPrice]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "futureBalance"=$1 
      WHERE "userId"=$2;`,
      values: [newFutureBalance, userId]
    });

    const serverTime = moment().tz('Europe/Warsaw');
    const timestamp = serverTime.format('YYYY-MM-DD HH:mm:ss.SSS');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE futures_limit_history 
      SET "status" = $1, "endDate" = $2 
      WHERE "userId" = $3 AND "orderId" = $4;`,
      values: ['filled', timestamp, userId, id]
    });

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM futures_limit_orders
      WHERE id = $1;`,
      values: [id]
    });

    await pool.query('COMMIT');

    return true;
    
  } catch (error) {   
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

module.exports = openLimitFutures;