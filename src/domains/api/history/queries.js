const pool = require('../../../config/db');

// function that returns the last 20 historical positions for the spot market for a given pair
const getSpotHistoryPair = async (userId, pair) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM history_spot
      WHERE "userId" = $1 AND "pair"= $2
      ORDER BY date DESC
      LIMIT 20;`,
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

// function that returns the last 20 historical positions for the spot market for a given pair
const getSpotHistoryPairConditional = async (userId, pair, from) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM history_spot
      WHERE "userId" = $1 AND "pair"= $2 AND id < $3
      ORDER BY date DESC
      LIMIT 20;`,
      values: [userId, pair, from]
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

// function that returns the last 20 historical positions for the spot market
const getSpotHistory = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM history_spot
      WHERE "userId" = $1
      ORDER BY date DESC
      LIMIT 20;`,
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

// function that returns the last 20 historical positions for the spot market
const getSpotHistoryConditional = async (userId, from) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM history_spot
      WHERE "userId" = $1
      AND id < $2
      ORDER BY date DESC
      LIMIT 20;`,
      values: [userId, from]
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

// function that returns the last 20 historical positions for the futures market for a given pair
const getFuturesHistoryPair = async (userId, pair) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_history
      WHERE "userId" = $1 AND "pair"=$2
      ORDER BY date DESC
      LIMIT 20;`,
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

const getFuturesHistoryPairConditional = async (userId, pair, from) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_history
      WHERE "userId" = $1 AND "pair" = $2 AND id < $3
      ORDER BY date DESC
      LIMIT 20;`,
      values: [userId, pair, from]
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

// function that returns the last 20 historical positions for the futures market
const getFuturesHistory = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_history
      WHERE "userId" = $1
      ORDER BY date DESC
      LIMIT 20;`,
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

const getFuturesHistoryConditional = async (userId, from) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_history
      WHERE "userId" = $1
      AND id < $2
      ORDER BY date DESC
      LIMIT 20;`,
      values: [userId, from]
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

module.exports = { getSpotHistoryPair, getSpotHistory, getFuturesHistory, getFuturesHistoryPair, getSpotHistoryConditional, getSpotHistoryPairConditional, getFuturesHistoryPairConditional, getFuturesHistoryConditional };