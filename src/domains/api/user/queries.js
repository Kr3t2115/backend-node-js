const pool = require('../../../config/db');


const getUser = async(userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT firstname, lastname, email, "profilePicture"
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

const updateProfile = async(filename, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT "profilePicture"
      FROM users
      WHERE "id" = $1`,
      values: [userId]
    });
    await pool.query({
      rowMode: 'object',
      text: `UPDATE users 
      SET "profilePicture" = $1 
      WHERE id = $2
      RETURNING "profilePicture"`,
      values: [filename, userId]
    });

    if(result.rowCount == 1){
      return result.rows[0].profilePicture;
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
}

module.exports = { getUser, updateProfile };