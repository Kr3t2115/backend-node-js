const pool = require('../config/db')

// query returning account wallet informations
const getUserWallet = async (userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM wallet WHERE \"userId\"='${userId}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  } 
}
module.exports = getUserWallet;