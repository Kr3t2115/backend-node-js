const pool = require('../../../config/db');

const getFuturesPositions = async(userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_positions 
      WHERE "userId" = $1;`,
      values: [userId]
    });
    
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const getSpotPrices = async() => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT spot
      FROM crypto_prices`
    });
    
    if(result.rowCount == 1){
      return result.rows[0].spot;
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const getFuturesPrices = async() => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT futures
      FROM crypto_prices`
    });
    
    if(result.rowCount == 1){
      return result.rows[0].futures;
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

const getLimitSpot = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM spot_limit_orders
      WHERE "userId" = $1;`,
      values: [userId]
    })
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    return false;
  }
}

const getLimitFutures = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_limit_orders
      WHERE "userId" = $1;`,
      values: [userId]
    })
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    return false;
  }
}

const getPredictedBalance = async (limit, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM predicted_balance 
      WHERE "userId" = $2
      ORDER BY date 
      DESC LIMIT $1;`,
      values: [limit, userId]
    })

    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    console.log(error)
    return false;
  }
}


module.exports = { getFuturesPositions, getSpotPrices, getFuturesPrices, getLimitSpot, getLimitFutures, getPredictedBalance };