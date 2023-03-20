const pool = require('../config/db');
const closePosition = require('./closePosition');

const queryCryptoPrices = async (updatedPrices) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `UPDATE crypto_prices 
      SET "cryptocurrencies" = $1 
      WHERE id = '1';`,
      values: [updatedPrices]
    })
    if(result.rowCount == 1){
      return result.rows[0];
    }
    return false
  } catch (error) {
    console.log(error);
    return false;
  }  
}

const queryLiquidation = async (pair, price) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_positions 
      WHERE pair = $1
      AND ("type" = 'LONG' AND("stopLoss" >= $2 OR "takeProfit" <= $2 OR "liquidationPrice" >= $2)) 
      OR ("pair" = $1 AND ("type"='SHORT' AND("stopLoss" <= $2 OR "takeProfit" >= $2 OR "liquidationPrice" <= $2)))`,
      values: [pair, price]
    })

    // conditional instruction checks at what price the position should be closed
    if(result.rowCount){
      result.rows.map(position => {
        let closeBy;
        if(position.type == "LONG"){
          if(position.stopLoss >= price){
            closeBy = position.stopLoss;
          }else if(x.liquidationPrice >= price){
            closeBy = position.liquidationPrice;
          }else if(x.takeProfit <= price){
            closeBy = position.takeProfit;
          }
        }
        else{
          if(x.stopLoss <= price){
            closeBy = position.stopLoss;
          }else if(x.liquidationPrice <= price){
            closeBy = position.liquidationPrice;
          }else if(x.takeProfit >= price){
            closeBy = position.takeProfit;
          }
        }
        closePosition(
          position.id, 
          position.pair, 
          closeBy, 
          position.type, 
          position.quantity, 
          position.leverage, 
          position.purchasePrice, 
          position.userId
        );
      })
      return result.rows;
    }else{
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  } 
}

module.exports = {queryCryptoPrices, queryLiquidation};