const pool = require('../../../config/db');

// query returning user opened positions
const querySpotPositions = async (user_id, pair) => {

  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM spot_positions WHERE user_id='${user_id}'` + (pair ? ` AND pair = '${pair}'` : ``) 
  });

  if(result.rows){
    return result.rows;
  }else{
    return false;
  }
  
}

module.exports = { querySpotPositions };