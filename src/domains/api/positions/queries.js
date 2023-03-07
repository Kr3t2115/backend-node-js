const pool = require('../../../config/db');

// query returning user opened positions
const querySpotPositions = async (userId, pair) => {

  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM spot_positions WHERE \"userId\"='${userId}'` + (pair ? ` AND pair = '${pair}'` : ``) 
  });

  if(result.rows){
    return result.rows;
  }else{
    return false;
  }
  
}

module.exports = { querySpotPositions };