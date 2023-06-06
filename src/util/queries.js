const pool = require('../config/db');
const closePosition = require('./closePosition');

// function updating cryptocurrency prices in the database
const queryCryptoPrices = async (spotPrices, futuresPrices) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `UPDATE crypto_prices 
      SET "spot" = $1, "futures" = $2
      WHERE id = '1';`,
      values: [spotPrices, futuresPrices]
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

// function to find positions to be closed at take profit, stop loss and liquidation prices
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
      for (const position of result.rows) {
        let closeBy;
        if(position.type == "LONG"){
          if(position.stopLoss && position.stopLoss >= price){
            closeBy = position.stopLoss;
          }else if(position.liquidationPrice >= price){
            closeBy = position.liquidationPrice;
          }else if(position.takeProfit <= price){
            closeBy = position.takeProfit;
          }
        }
        else{
          if(position.stopLoss && position.stopLoss <= price){
            closeBy = position.stopLoss;
          }else if(position.liquidationPrice <= price){
            closeBy = position.liquidationPrice;
          }else if(position.takeProfit >= price){
            closeBy = position.takeProfit;
          }
        }
        
        await closePosition(
          position.id, 
          position.pair, 
          closeBy, 
          position.type, 
          position.quantity, 
          position.leverage, 
          position.purchasePrice, 
          position.userId
        );
      }
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