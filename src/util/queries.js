const pool = require('../config/db')

const queryCryptoPrices = async (updatedPrices) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE crypto_prices SET cryptocurrencies = '${updatedPrices}' WHERE id = '1';`
  })

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false
  }
  
}



module.exports = {queryCryptoPrices};