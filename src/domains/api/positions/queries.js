const pool = require('../../../config/db');

// query returning account wallet informations
const querySpotPositions = async (user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM spot_positions WHERE user_id='${user_id}';` 
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  }
  
}

module.exports = { querySpotPositions };