const getUserWallet = require('../services/getUserWallet');
const pool = require('../config/db');

const spotLimitSell = async (id, pair, quantity, price, userId) => {
  const wallet = await getUserWallet(userId);
  
  let newCryptocurrencyBalance = wallet.spotBalance;
  newCryptocurrencyBalance[pair] = newCryptocurrencyBalance[pair] - quantity;

  const newAccountBalance = wallet.balance + price * req.body.quantity;

  const result = await insertSpotByLimit(
    pair,
    quantity,
    price,
    userId,
    newCryptocurrencyBalance,
    id
  )
  console.log(result)
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

    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
  return true;
}

module.exports = spotLimitSell;