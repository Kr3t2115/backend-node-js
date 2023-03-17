const pool = require('../../../config/db');

// query returning user opened positions
const querySpotHistoryPair = async (userId, pair) => {

  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT *
    FROM spot_history
    WHERE \"userId"\ = ${userId} AND pair='${pair}'
    ORDER BY date DESC
    LIMIT 20;` 
  });

  if(result.rows){
    return result.rows;
  }else{
    return false;
  }
  
}

const querySpotHistory = async (userId) => {
 
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT *
    FROM spot_history
    WHERE \"userId"\ = ${userId}
    ORDER BY date DESC
    LIMIT 20;` 
  });

  if(result.rows){
    return result.rows;
  }else{
    return false;
  }
  
}

const queryFuturesHistoryPair = async (userId, pair) => {

  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT *
    FROM futures_history
    WHERE \"userId"\ = ${userId} AND pair='${pair}'
    ORDER BY date DESC
    LIMIT 20;` 
  });

  if(result.rows){
    return result.rows;
  }else{
    return false;
  }
  
}

const queryFuturesHistory = async (userId) => {
 
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT *
    FROM futures_history
    WHERE \"userId"\ = ${userId}
    ORDER BY date DESC
    LIMIT 20;` 
  });

  if(result.rows){
    return result.rows;
  }else{
    return false;
  }
  
}

module.exports = { querySpotHistoryPair, querySpotHistory, queryFuturesHistory, queryFuturesHistoryPair };