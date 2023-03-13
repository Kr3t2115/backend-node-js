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

const queryLiquidation = async (pair, price) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * FROM futures_positions WHERE pair='${pair}' 
      AND (type='LONG' AND(\"stopLoss\" >= ${price} OR \"takeProfit\" <= ${price} OR \"liquidationPrice\" >= ${price})) 
      OR (type='SHORT' AND(\"stopLoss\" <= ${price} OR \"takeProfit\" >= ${price} OR \"liquidationPrice\" <= ${price}))`
    })
  
    if(result.rowCount){
      return result.rows;
    }else{
      return false
    }
  } catch (error) {
    console.log(error)
  }
  
}



module.exports = {queryCryptoPrices, queryLiquidation};