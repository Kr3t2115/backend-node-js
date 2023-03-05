const pool = require('../../../config/db')

// query that returns the prices of the pair given in the parameter
const queryPairPrice = async(pair) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT cryptocurrencies FROM cryptoprices WHERE id=1;`
  });

  if(result.rowCount == 1){
    return result.rows[0].cryptocurrencies[pair];
  }else{
    return false;
  }
}

// query returning account wallet informations
const queryUserBalance = async (user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM wallet WHERE user_id='${user_id}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  } 
}

const insertPosition = async(pair, type, quantity, leverage, purchase_price, takeprofit, stoploss, user_id, liquidationPrice, newAccountBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO futures_positions (pair, type, quantity, leverage, purchase_price, takeprofit, stoploss, user_id, liquidation_price) VALUES ('${pair}', '${type}', '${quantity}', '${leverage}', '${purchase_price}', ${takeprofit}, ${stoploss}, '${user_id}', ${liquidationPrice});`
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet SET balance='${newAccountBalance}' WHERE user_id='${user_id}';`
    });

    await pool.query('COMMIT');
  } catch (error) {
    return false;
  }
  return true;
}

module.exports = {queryPairPrice, queryUserBalance, insertPosition}