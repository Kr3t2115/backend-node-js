const pool = require('../../../config/db');

// function responsible for adding items and updating the user's portfolio in the database
const insertPosition = async(pair, quantity, purchasePrice, userId, newAccountBalance, newCryptoBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      spot_positions ("pair", "quantity", "purchasePrice", "userId") 
      VALUES ($1, $2, $3, $4);`,
      values: [pair, quantity, purchasePrice, userId]
      });
      
    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      history_spot ("pair", "type", "quantity", "price", "userId") 
      VALUES ($1, 'buy', $2, $3, $4);`,
      values: [pair, quantity, purchasePrice, userId]
    });  

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1, "spotBalance" = $2 
      WHERE "userId" = $3;`,
      values: [newAccountBalance, newCryptoBalance, userId]
    });

    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

const insertLimitOrder = async(pair, quantity, price, userId, type, newAccountBalance, newCryptocurrencyBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      spot_limit_orders ("pair", "quantity", "price", "type", "userId") 
      VALUES ($1, $2, $3, $4, $5);`,
      values: [pair, quantity, price, type, userId]
      });
      
    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1, "spotBalance" = $2 
      WHERE "userId" = $3;`,
      values: [newAccountBalance, newCryptocurrencyBalance, userId]
    });

    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

const closeLimitOrder = async(id, userId, newAccountBalance, newCryptocurrencyBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM 
      spot_limit_orders
      WHERE id = $1 AND "userId" = $2 ;`,
      values: [id, userId]
      });
      
    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1, "spotBalance" = $2
      WHERE "userId" = $3;`,
      values: [newAccountBalance, newCryptocurrencyBalance, userId]
    });

    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

const getLimitOrder = async(id, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM spot_limit_orders 
      WHERE "id" = $1 AND "userId" = $2;`,
      values: [id, userId]
    });
  
    if(result.rowCount == 1){
      return result.rows[0];
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const updatePosition = async(cryptoQuantity, purchasePrice, pair, userId, newAccountBalance, newCryptoBalance, quantity, selling_price) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE spot_positions 
      SET "quantity" = $1, "purchasePrice" = $2 
      WHERE "pair" = $3 AND "userId" = $4;`,
      values: [cryptoQuantity, purchasePrice, pair, userId]
      });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1, "spotBalance" = $2 
      WHERE "userId" = $3;`,
      values: [newAccountBalance, newCryptoBalance, userId]
    });

    // conditional statement runs an additional query only when quantity and selling_price exist. And they can only exist when selling position
    if(quantity && selling_price){
      await pool.query({
          rowMode: 'object',
          text: `INSERT INTO 
          history_spot ("pair", "type", "quantity", "price", "userId") 
          VALUES ($1, 'sell', $2, $3, $4);`,
          values: [pair, quantity, selling_price, userId]
      });  
    }else{
        await pool.query({
          rowMode: 'object',
          text: `INSERT INTO 
          history_spot ("pair", "type", "quantity", "price", "userId") 
          VALUES ($1, 'buy', $2, $3, $4);`,
          values: [pair, quantity, purchasePrice, userId]
         }); 
    }
    
    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

const deletePosition = async(pair, userId, newAccountBalance, newCryptoBalance, quantity, purchasePrice, selling_price) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM spot_positions 
      WHERE "pair" = $1 AND "userId" = $2;`,
      values: [pair, userId]
      });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1, "spotBalance" = $2 
      WHERE "userId" = $3;`,
      values: [newAccountBalance, newCryptoBalance, userId]
    });

   await pool.query({
          rowMode: 'object',
          text: `INSERT INTO 
          history_spot ("pair", "type", "quantity", "price", "userId") 
          VALUES ($1, 'sell', $2, $3, $4);`,
          values: [pair, quantity, selling_price, userId]
      });

    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

const getPostition = async(pair, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM spot_positions 
      WHERE "pair" = $1 AND "userId" = $2;`,
      values: [pair, userId]
    });
  
    if(result.rowCount == 1){
      return result.rows[0];
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

module.exports = { insertPosition, getPostition, deletePosition, updatePosition, insertLimitOrder, getLimitOrder, closeLimitOrder };