const pool = require('../../config/db');

// query returning user account balans
const queryCryptoPrices = async (id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM crypto_prices WHERE id=1;`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  }
  
}

module.exports = queryCryptoPrices;