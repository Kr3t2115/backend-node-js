const pool = require('../../../config/db')

// function that retrieves information about an item with a given id from the database
const getPosition = async(id, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM futures_positions
    WHERE "userId"=$1 AND "id"=$2;`,
    values: [userId, id]
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  } 
}

// function responsible for adding a new item to the database, and updating the user's wallet
const insertPosition = async(pair, type, quantity, leverage, purchasePrice, takeProfit, stopLoss, userId, liquidationPrice, newAccountBalance, newFutureBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO futures_positions ("pair", "type", "quantity", "leverage", "purchasePrice", "takeProfit", "stopLoss", "userId", "liquidationPrice") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      values: [pair, type, quantity, leverage, purchasePrice, takeProfit, stopLoss, userId, liquidationPrice]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance"=$1, "futureBalance"=$2 
      WHERE "userId"=$3;`,
      values: [newAccountBalance, newFutureBalance, userId]
    });

    await pool.query('COMMIT');

  } catch (error) {    
    console.log(error)
    return false;
  }
  return true;
}

// function responsible for updating items in the database and updating the user's wallet. It also adds information to futures_history
const updatePosition = async(quantity, id, userId, newAccountBalance, newFutureBalance, pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE futures_positions 
      SET "quantity"=$1 
      WHERE "id"=$2 AND "userId"=$3;`,
      values: [quantity, id, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance"=$1, "futureBalance"=$2
      WHERE "userId"=$3;`,
      values: [newAccountBalance, newFutureBalance, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO futures_history ("pair", "quantityPosition", "quantitySold", "leverage", "purchasePrice", "sellingPrice", "userId") 
      VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      values: [pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice, userId]
    });

    await pool.query('COMMIT');

  } catch (error) {
    console.log(error)
    return false;
  }
  return true;
}

// function responsible for updates in data positions such as stop loss and take profit
const updateTPSL = async(takeProfit, stopLoss, id, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `UPDATE futures_positions 
      SET "takeProfit"=$1, "stopLoss"=$2
      WHERE "id"=$3 AND "userId"=$4;`,
      values: [takeProfit, stopLoss, id, userId]
    });
  
    if(result.rowCount === 1){
      return true;
    }else{
      return false;
    } 
  } catch (error) {
    console.log(error);
    return false;
  }
}

// function that removes positions from the database, also updates the user's portfolio, and adds an entry to futures_history
const deletePosition = async (id, userId, newAccountBalance, newFutureBalance, pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM futures_positions 
      WHERE "id"=$1 AND "userId"=$2`,
      values: [id, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance"=$1, "futureBalance"=$2
      WHERE "userId"=$3`,
      values: [newAccountBalance, newFutureBalance, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO futures_history ("pair", "quantityPosition", "quantitySold", "leverage", "purchasePrice", "sellingPrice", "userId") 
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      values: [pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice, userId]
    });

    await pool.query('COMMIT');

  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
};

module.exports = {insertPosition, updatePosition, getPosition, deletePosition, updateTPSL}