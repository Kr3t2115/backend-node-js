const pool = require('../../../config/db');

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

// query updating the user's wallet
const updateWallet = async(newAccountBalance, newCryptoBalance, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE wallet SET balance='${newAccountBalance}', spotbalance = '${newCryptoBalance}' WHERE user_id='${user_id}';`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }else{
    return false;
  }
}

const insertPosition = async(pair, quantity, purchase_price, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO spot_positions (pair, quantity, purchase_price, user_id) VALUES ('${pair}', '${quantity}', ${purchase_price}, '${user_id}');`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }

 return false;  
}

const deletePosition = async(pair, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `DELETE FROM spot_positions WHERE pair='${pair}' AND user_id = '${user_id}';`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }

  return false;
}

const updatePosition = async(quantity, purchase_price, pair, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE spot_positions SET quantity='${quantity}', purchase_price='${purchase_price}' WHERE pair='${pair}' AND user_id='${user_id}';`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }else{
    return false;
  }
}

const queryPostition = async(pair, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM spot_positions WHERE pair='${pair}' AND user_id='${user_id}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  }
}

const insertHistoricTrade = async(pair, quantity, purchase_price, selling_price, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO spot_history (pair, quantity, purchase_price, selling_price, user_id) VALUES ('${pair}', '${quantity}', ${purchase_price}, '${selling_price}', '${user_id}');`
  });

  if(result.rowCount == 1){
    return result.rowCount;
  }else{
    return false;
  }
}

module.exports = {queryUserBalance, queryPairPrice, updateWallet, insertPosition, queryPostition, deletePosition, updatePosition, insertHistoricTrade};