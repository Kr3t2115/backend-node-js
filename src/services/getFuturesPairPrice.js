const pool = require('../config/db')

// query that returns the prices of the pair given in the parameter
const getPairPrice = async(pair) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT futures 
      FROM crypto_prices 
      WHERE id = 1;`,
    });
  
    if(result.rowCount == 1){
      return result.rows[0].futures[pair];
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports = getPairPrice;