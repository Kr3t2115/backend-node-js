const pool = require('../../../config/db')

// query returning account wallet informations
const queryUserBalance = async (id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM wallet WHERE user_id='${id}';`
  })

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false
  }
  
}

// query that returns the prices of the pair given in the parameter
const queryPairPrice = async(pair) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT cryptocurrencies FROM cryptoprices WHERE id=1;`
  })

  if(result.rowCount == 1){
    return result.rows[0].cryptocurrencies[pair];
  }else{
    return false
  }
}

// query updating the user's wallet
const updateWallet = async(newAccountBalance, newCryptoBalance, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE wallet SET balance='${newAccountBalance}', spotbalance = '${newCryptoBalance}' WHERE user_id='${user_id}';`
  })

  if(result.rowCount == 1){
    return result.rowCount;
  }else{
    return false
  }
}

module.exports = {queryUserBalance, queryPairPrice, updateWallet};