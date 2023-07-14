const getUserWallet = require('../services/getUserWallet');
const pool = require('../config/db');

const spotLimitBuy = async (id, pair, quantity, price, userId) => {
  const wallet = await getUserWallet(userId);

  let newCryptocurrencyBalance = wallet.spotBalance;

  if(wallet.spotBalance == null){
      newCryptocurrencyBalance = {};
  }

  if(newCryptocurrencyBalance[pair] == null){
    newCryptocurrencyBalance[pair] = quantity;
  }else{
    let cryptoQuantity = Number(quantity) + Number(wallet.spotBalance[pair]);
    newCryptocurrencyBalance[pair] = cryptoQuantity.toFixed(1);
  }

  const result = await insertSpotByLimit(
    pair,
    quantity,
    price,
    userId,
    newCryptocurrencyBalance,
    id
  )
} 

const insertSpotByLimit = async(pair, quantity, price, userId, newSpotBalance, id) => {
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
      text: `UPDATE spot_limit_history 
      SET "status" = $1 
      WHERE "userId" = $2 AND "orderId" = $3;`,
      values: ['filled', userId, id]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "spotBalance" = $1 
      WHERE "userId" = $2;`,
      values: [newSpotBalance, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM spot_limit_orders
      WHERE id = $1;`,
      values: [id]
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      history_spot ("pair", "type", "quantity", "price", "userId") 
      VALUES ($1, 'buy', $2, $3, $4);`,
      values: [pair, quantity, price, userId]
    }); 

    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
  return true;
}

module.exports = spotLimitBuy;