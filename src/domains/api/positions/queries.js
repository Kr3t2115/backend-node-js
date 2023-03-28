const pool = require('../../../config/db');

// function returning open positions by the user in the spot market
const getSpotPositionsAll = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM spot_positions 
      WHERE "userId"=$1`,
      values: [userId]
    });
  
    if(result.rows){
      return result.rows;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// function returning open positions by the user after a given pair on the spot market
const getSpotPositionsByPair = async (userId, pair) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM spot_positions 
      WHERE "userId"=$1 AND pair = $2`,
      values: [userId, pair]
    });
  
    if(result.rows){
      return result.rows;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// function returning open positions by the user in the spot market
const getFuturesPositionsAll = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_positions 
      WHERE "userId"=$1`,
      values: [userId]
    });
  
    if(result.rows){
      return result.rows;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// function returning open positions by the user after a given pair on the spot market
const getFuturesPositionsByPair = async (userId, pair) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_positions 
      WHERE "userId"=$1 AND pair = $2`,
      values: [userId, pair]
    });
  
    if(result.rows){
      return result.rows;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = { getSpotPositionsAll, getSpotPositionsByPair, getFuturesPositionsAll, getFuturesPositionsByPair };