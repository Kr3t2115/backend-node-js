const pool = require('../../../config/db');

const getUser = async(userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT firstname, lastname, email, "profilePicture", username
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

const queryAccountUsername = async (username, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM users 
      WHERE username = $1
      AND id != $2;`,
      values: [username, userId]
    });
  
    if(result.rowCount == 1){
      return result.rows[0];
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const updateAccount = async(firstname, lastname, username, userId) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `UPDATE users 
      SET "firstname" = $1, "lastname" = $2, "username" = $3
      WHERE id = $4
      RETURNING "profilePicture"`,
      values: [firstname, lastname, username, userId]
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

const deleteRefreshToken = async(token, userId) => {
  try{
  const result = await pool.query({
    rowMode: 'object',
    text: `DELETE FROM
    refresh_tokens
    WHERE token = $1 AND "userId" = $2`,
    values: [token, userId]
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

module.exports = { getUser, updateProfile, updateAccount, queryAccountUsername, deleteRefreshToken };