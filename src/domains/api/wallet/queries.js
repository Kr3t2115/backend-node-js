const pool = require('../../../config/db')

const queryBalance = async (id) => {
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

module.exports = queryBalance;