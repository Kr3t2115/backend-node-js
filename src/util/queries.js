const pool = require('../config/db');
const closePosition = require('./closePosition');
const spotLimitBuy = require('./spotLimitBuy');
const spotLimitSell = require('./spotLimitSell');
const openLimitFutures = require('./openLimitFutures');

const queryAllWallets = async () => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM wallet;`,
    })
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    return false;
  }
}

const insertPredictedBalance = async(balance, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO 
      predicted_balance ("balance", "userId") 
      VALUES ($1, $2)`,
      values: [balance, userId]
    })
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    console.log(error)
    return false;
  }
}

const queryPositions = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_positions
      WHERE "userId" = $1;`,
      values: [userId]
    })
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    return false;
  }
}

const getLimitSpot = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM spot_limit_orders
      WHERE "userId" = $1;`,
      values: [userId]
    })
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    return false;
  }
}

const getLimitFutures = async (userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT *
      FROM futures_limit_orders
      WHERE "userId" = $1;`,
      values: [userId]
    })
    if(result.rowCount >= 1){
      return result.rows;
    }
    return false
  } catch (error) {
    return false;
  }
}

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

const querySpotLimit = async(pair, price) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM spot_limit_orders 
      WHERE pair = $1
      AND ("type" = 'buy' AND("price" >= $2)) 
      OR ("type" = 'sell' AND("price" <= $2))`,
      values: [pair, price]
    })
    if(result.rowCount){
      for (const position of result.rows) {
        console.log(position);
        if(position.type == 'buy'){
          spotLimitBuy(
            position.id,
            position.pair,
            position.quantity,
            position.price,
            position.userId
          )
        }
        else if(position.type == 'sell'){
          spotLimitSell(
            position.id,
            position.pair,
            position.quantity,
            position.price,
            position.userId
          )
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const queryFuturesLimit = async(pair, price) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM futures_limit_orders 
      WHERE pair = $1
      AND ("type" = 'LONG' AND("price" >= $2)) 
      OR ("type" = 'SHORT' AND("price" <= $2))`,
      values: [pair, price]
    })
    if(result.rowCount){
      for (const position of result.rows) {
        console.log(position);
        openLimitFutures(
          position.id,
          position.pair,
          position.type,
          position.quantity,
          position.price,
          position.leverage,
          position.takeProfit,
          position.stopLoss,
          position.userId
        )
      }
    }
  } catch (error) {
    console.log(error);
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

module.exports = {queryCryptoPrices, queryLiquidation, querySpotLimit, queryFuturesLimit, queryAllWallets, queryPositions, getLimitSpot, getLimitFutures, insertPredictedBalance};