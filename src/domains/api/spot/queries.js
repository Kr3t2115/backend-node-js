const pool = require('../../../config/db')

const queryCryptoBalance = async (id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM wallet WHERE user_id='${id}';`
  })

  if(result.rowCount == 1){
    return result.rows[0].spotbalance;
  }else{
    return false
  }
  
}

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

const updateWallet = async(newAccountBalance, newCryptoBalance, user_id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `UPDATE wallet SET balance='${newAccountBalance}', spotbalance = '${newCryptoBalance}' WHERE user_id='${user_id}';`
  })

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false
  }
}

module.exports = {queryCryptoBalance, queryUserBalance, queryPairPrice, updateWallet};