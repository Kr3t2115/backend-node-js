const pool = require('../../../config/db');

// query returning user account balans
const queryBalance = async (id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM wallet WHERE \"userId\"='${id}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  }
  
}

module.exports = queryBalance;