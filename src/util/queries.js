const pool = require('../config/db');
const closePosition = require('./closePosition');

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
      OR (pair='${pair}' AND (type='SHORT' AND(\"stopLoss\" <= ${price} OR \"takeProfit\" >= ${price} OR \"liquidationPrice\" <= ${price})))`
    })

    

    if(result.rowCount){
      console.log(pair + price)
      console.log(result.rows)

      result.rows.map(x => {
        if(x.type == "LONG"){
          if(x.stopLoss >= price){
            closePosition(x.id, x.pair, x.stopLoss, x.type, x.quantity, x.leverage, x.purchasePrice, x.userId);
          }else if(x.liquidationPrice >= price){
            closePosition(x.id, x.pair, x.liquidationPrice, x.type, x.quantity, x.leverage, x.purchasePrice, x.userId);
          }else if(x.takeProfit <= price){
            closePosition(x.id, x.pair, x.takeProfit, x.type, x.quantity, x.leverage, x.purchasePrice, x.userId);
          }
        }
        else{
          if(x.stopLoss <= price){
            closePosition(x.id, x.pair, x.stopLoss, x.type, x.quantity, x.leverage, x.purchasePrice, x.userId);
          }else if(x.liquidationPrice <= price){
            closePosition(x.id, x.pair, x.liquidationPrice, x.type, x.quantity, x.leverage, x.purchasePrice, x.userId);
          }else if(x.takeProfit >= price){
            closePosition(x.id, x.pair, x.takeProfit, x.type, x.quantity, x.leverage, x.purchasePrice, x.userId);
          }
        }
        
      })

      return result.rows;
    }else{
      return false
    }
  } catch (error) {
    console.log(error)
  }
  
}



module.exports = {queryCryptoPrices, queryLiquidation};