const pool = require('../../../config/db')

// query that returns the prices of the pair given in the parameter
const queryPairPrice = async(pair) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT cryptocurrencies FROM crypto_prices WHERE id=1;`
  });

  if(result.rowCount == 1){
    return result.rows[0].cryptocurrencies[pair];
  }else{
    return false;
  }
}

// query returning account wallet informations
const queryUserBalance = async (userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM wallet WHERE \"userId\"='${userId}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  } 
}

const insertPosition = async(pair, type, quantity, leverage, purchasePrice, takeProfit, stopLoss, userId, liquidationPrice, newAccountBalance, newFutureBalance) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO futures_positions (pair, type, quantity, leverage, \"purchasePrice"\, \"takeProfit"\, \"stopLoss"\, \"userId\", \"liquidationPrice"\) VALUES ('${pair}', '${type}', '${quantity}', '${leverage}', '${purchasePrice}', ${takeProfit}, ${stopLoss}, '${userId}', ${liquidationPrice});`
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet SET balance='${newAccountBalance}', \"futureBalance\"='${newFutureBalance}' WHERE \"userId\"='${userId}';`
    });

    await pool.query('COMMIT');
  } catch (error) {
    console.log(error)
    return false;
  }
  return true;
}

const updatePosition = async(quantity, id, userId, newAccountBalance, newFutureBalance, pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE futures_positions SET quantity=${quantity} WHERE id=${id} AND \"userId\"='${userId}';`
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet SET balance='${newAccountBalance}', \"futureBalance\"='${newFutureBalance}' WHERE \"userId\"='${userId}';`
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO futures_history (pair, \"quantityPosition"\, \"quantitySold"\, leverage, \"purchasePrice"\, \"sellingPrice"\, \"userId\") VALUES ('${pair}', '${quantityPosition}', '${quantitySold}', '${leverage}', '${purchasePrice}', ${sellingPrice}, '${userId}');`
    });

    await pool.query('COMMIT');
  } catch (error) {
    console.log(error)
    return false;
  }
  return true;
}

const queryPosition = async(id, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM futures_positions WHERE \"userId\"='${userId}' AND id='${id}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  } 
}

const deletePosition = async(id, userId, newAccountBalance, newFutureBalance, pair, quantityPosition, quantitySold, leverage, purchasePrice, sellingPrice) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM futures_positions WHERE id='${id}' AND \"userId\" = '${userId}';`
    });

    await pool.query({
      rowMode: 'object',
      text: `UPDATE wallet SET balance='${newAccountBalance}', \"futureBalance\"='${newFutureBalance}' WHERE \"userId\"='${userId}';`
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO futures_history (pair, \"quantityPosition"\, \"quantitySold"\, leverage, \"purchasePrice"\, \"sellingPrice"\, \"userId\") VALUES ('${pair}', '${quantityPosition}', '${quantitySold}', '${leverage}', '${purchasePrice}', ${sellingPrice}, '${userId}');`
    });

    await pool.query('COMMIT');
  } catch (error) {
    console.log(error)
    return false;
  }
  return true;
}

const updateTPSL = async(takeProfit, stopLoss, id, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE futures_positions SET \"takeProfit"\=${takeProfit}, \"stopLoss\"=${stopLoss} WHERE id=${id} AND \"userId\"='${userId}';`
  });

  if(result.rowCount == 1){
    return true;
  }else{
    return false;
  } 
}

module.exports = {queryPairPrice, queryUserBalance, insertPosition, updatePosition, queryPosition, deletePosition, updateTPSL}