const pool = require('../config/db')

// query returning account wallet informations
const getUserWallet = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM wallet 
      WHERE "userId" = $1;`,
      values: [userId]
    });
  
    if(result.rowCount == 1){
      return result.rows[0];
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = getUserWallet;