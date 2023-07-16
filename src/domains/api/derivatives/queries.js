const pool = require('../../../config/db')
const moment = require('moment-timezone');

// function that retrieves information about an item with a given id from the database
const getPosition = async(id, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_positions
      WHERE "userId"=$1 AND "id"=$2;`,
      values: [userId, id]
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

const getLimitOrder = async(id, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_limit_orders
      WHERE "userId"=$1 AND "id"=$2;`,
      values: [userId, id]
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

const getLimitOrders = async(userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_limit_orders
      WHERE "userId"=$1`,
      values: [userId]
    });  
    return result.rows;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const getLimitHistory = async(userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_limit_history
      WHERE "userId"=$1
      ORDER BY "startDate" DESC
      LIMIT 20;`,
      values: [userId]
    });  
    return result.rows;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const getLimitHistoryConditional = async(userId, from) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_limit_history
      WHERE "userId"=$1
      AND id < $2
      ORDER BY "startDate" DESC
      LIMIT 20;`,
      values: [userId, from]
    });  
    return result.rows;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const getLimitHistoryByPair = async(userId, pair) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_limit_history
      WHERE "userId"=$1 AND "pair" LIKE '%' || $2 || '%'
      ORDER BY "startDate" DESC
      LIMIT 20;`,
      values: [userId, pair]
    });  
    return result.rows;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const getLimitHistoryByPairConditional = async(userId, pair, from) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_limit_history
      WHERE "userId"=$1 AND "pair" LIKE '%' || $2 || '%'
      AND id < $3
      ORDER BY "startDate" DESC
      LIMIT 20;`,
      values: [userId, pair, from]
    });  
    return result.rows;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const insertLimitPosition = async(pair, type, quantity, leverage, price, takeProfit, stopLoss, userId, newAccountBalance) => {
  try {
    await pool.query('BEGIN');

    const result = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      futures_limit_orders ("pair", "type", "quantity", "leverage", "price", "takeProfit", "stopLoss", "userId") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;`,
      values: [pair, type, quantity, leverage, price, takeProfit, stopLoss, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      futures_limit_history ("type", "pair", "quantity", "price", "leverage", "takeProfit", "stopLoss", "userId", "orderId", "status") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      values: [type, pair, quantity, price, leverage, takeProfit, stopLoss, userId, result.rows[0].id, "active"]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance"=$1
      WHERE "userId"=$2;`,
      values: [newAccountBalance, userId]
    });

    await pool.query('COMMIT');

    return true;    
  } catch (error) {   
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

// function responsible for adding a new item to the database, and updating the user's wallet
const insertPosition = async(pair, type, quantity, leverage, purchasePrice, takeProfit, stopLoss, userId, liquidationPrice, newAccountBalance, newFutureBalance) => {
  try {
    await pool.query('BEGIN');

    const result = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      futures_positions ("pair", "type", "quantity", "leverage", "purchasePrice", "takeProfit", "stopLoss", "userId", "liquidationPrice") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;`,
      values: [pair, type, quantity, leverage, purchasePrice, takeProfit, stopLoss, userId, liquidationPrice]
    });

    const newPositionId = result.rows[0].id

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance"=$1, "futureBalance"=$2 
      WHERE "userId"=$3;`,
      values: [newAccountBalance, newFutureBalance, userId]
    });

    await pool.query('COMMIT');

    return newPositionId;
    
  } catch (error) {   
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

// function responsible for updating items in the database and updating the user's wallet. It also adds information to futures_history
const updatePosition = async(quantity, id, type, userId, newAccountBalance, newFutureBalance, pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice) => {
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
      text: `INSERT INTO 
      futures_history ("pair", "type", "quantityPosition", "quantitySold", "leverage", "purchasePrice", "sellingPrice", "userId") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      values: [pair, type, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice, userId]
    });

    await pool.query('COMMIT');

  } catch (error) {
    await pool.query('ROLLBACK'); 
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
const deletePosition = async (id, userId, type, newAccountBalance, newFutureBalance, pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice) => {
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
      text: `INSERT INTO 
      futures_history ("pair", "quantityPosition", "quantitySold", "leverage", "purchasePrice", "sellingPrice", "userId", "type") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      values: [pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice, userId, type]
    });

    await pool.query('COMMIT');

  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error);
    return false;
  }
  return true;
};

const closeLimitOrder = async(id, userId, newAccountBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM 
      futures_limit_orders
      WHERE id = $1 AND "userId" = $2 ;`,
      values: [id, userId]
      });
    
    const serverTime = moment().tz('Europe/Warsaw');
    const timestamp = serverTime.format('YYYY-MM-DD HH:mm:ss.SSS');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE futures_limit_history 
      SET "status" = $1, "endDate" = $2 
      WHERE "userId" = $3 AND "orderId" = $4;`,
      values: ['canceled', timestamp, userId, id]
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet 
      SET "balance" = $1
      WHERE "userId" = $2;`,
      values: [newAccountBalance, userId]
    });

    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error)
    return false;
  }
}

module.exports = {insertPosition, updatePosition, getPosition, deletePosition, updateTPSL, insertLimitPosition, getLimitOrder, closeLimitOrder, getLimitOrders, getLimitHistory, getLimitHistoryByPair, getLimitHistoryConditional, getLimitHistoryByPairConditional}