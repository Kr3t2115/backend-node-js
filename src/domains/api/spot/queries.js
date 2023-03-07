const pool = require('../../../config/db');

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

// query updating the user's wallet
const updateWallet = async(newAccountBalance, newCryptoBalance, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE wallet SET balance='${newAccountBalance}', \"spotBalance\" = '${newCryptoBalance}' WHERE \"userId\"='${userId}';`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }else{
    return false;
  }
}

const insertPosition = async(pair, quantity, purchasePrice, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO spot_positions (pair, quantity, \"purchasePrice\", \"userId\") VALUES ('${pair}', '${quantity}', '${purchasePrice}', '${userId}');`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }

  return false;  
}

const deletePosition = async(pair, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `DELETE FROM spot_positions WHERE pair='${pair}' AND \"userId\" = '${userId}';`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }

  return false;
}

const updatePosition = async(quantity, purchasePrice, pair, userId) => {
  console.log(quantity, purchasePrice, pair, userId)
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE spot_positions SET quantity='${quantity}', \"purchasePrice\"='${purchasePrice}' WHERE pair='${pair}' AND \"userId\"='${userId}';`
  });
  if(result.rowCount == 1){
    return result.rowCount;
  }else{
    return false;
  }
}

const queryPostition = async(pair, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM spot_positions WHERE pair='${pair}' AND \"userId\"='${userId}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  }
}

const insertHistoricTrade = async(pair, quantity, purchasePrice, selling_price, userId) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO spot_history (pair, quantity, \"purchasePrice\", \"sellingPrice\", \"userId\") VALUES ('${pair}', '${quantity}', ${purchasePrice}, '${selling_price}', '${userId}');`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }else{
    return false;
  }
}

module.exports = {queryUserBalance, queryPairPrice, updateWallet, insertPosition, queryPostition, deletePosition, updatePosition, insertHistoricTrade};