const pool = require('../../../config/db');


const getUser = async(userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT firstname, lastname, email
      FROM users 
      WHERE "id" = $1;`,
      values: [userId]
    });
    
    if(result.rowCount == 1){
      return result.rows[0];
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

module.exports = { getUser };