const pool = require('../../config/db');

// new user registration function
const registerUser = async (firstname, lastname, email, hashedPassword, username, code) => {
  try {
    await pool.query('BEGIN');

    const { rows: [user] } = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO users ("firstname", "lastname", "email", "password", "username", "isActive") 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id;`,
      values: [firstname, lastname, email, hashedPassword, username, 'false']
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO account_confirm ("userId", "code") 
      VALUES ($1, $2) 
      RETURNING id;`,
      values: [user.id, code]
    });

    await pool.query({
      rowMode: 'object',
      text: `INSERT INTO wallet ("balance", "userId") VALUES (10000, $1);`,
      values: [user.id]
    });

    await pool.query('COMMIT');
    return user.id;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error);
    return false;
  }
}

const insertConfirmationCode = async (userId, code) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO account_confirm ("userId", "code") 
      VALUES ($1, $2);`,
      values: [userId, code]
    });

    return true;
  } catch (error) {
    return false;
  }
}

const insertRefreshToken = async (token, userId) => {
  try{
    const result = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO refresh_tokens
      (token, "userId") VALUES
      ($1, $2)`,
      values: [token, userId]
    });

    if(result.rowCount == 1){
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const getRefreshToken = async (token) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM refresh_tokens 
      WHERE token = $1;`,
      values: [token]
    });
  
    if(result.rowCount == 1){
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}


// function that checks whether the account with the given e-mail exists
const queryAccount = async (email) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM users 
      WHERE email = $1;`,
      values: [email]
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


// function that checks whether the account with the given e-mail exists
const queryAccountUsername = async (username) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM users 
      WHERE username = $1;`,
      values: [username]
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

const checkCode = async (userId, code) => {
  try{
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM account_confirm 
      WHERE "userId" = $1 AND code = $2;`,
      values: [userId, code]
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

const updatePassword = async (userId, newPassword) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE users
      SET "password" = $1
      WHERE id = $2;`,
      values: [newPassword, userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM account_confirm 
      WHERE "userId" = $1`,
      values: [userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM refresh_tokens 
      WHERE "userId" = $1`,
      values: [userId]
    });
    
    await pool.query('COMMIT');  
    return true;
  
  } catch (error) {

    await pool.query('ROLLBACK'); 
    console.log(error);
    return false;
  }
}

const renewCode = async (userId, code) => {
  try{
    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM account_confirm 
      WHERE "userId" = $1`,
      values: [userId]
    });

    const result = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO account_confirm
      ("userId", code) 
      VALUES ($1, $2)
      `,
      values: [userId, code]
    });

    if(result.rowCount == 1){
      return true;
    }

    // console.log(result)
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const activeAccount = async (userId) => {
  try {
    await pool.query('BEGIN');

    await pool.query({
      rowMode: 'object',
      text: `UPDATE users
      SET "isActive" = true
      WHERE id = $1;`,
      values: [userId]
    });

    await pool.query({
      rowMode: 'object',
      text: `DELETE FROM account_confirm 
      WHERE "userId" = $1`,
      values: [userId]
    });

    await pool.query('COMMIT');
    return true;
  } catch (error) {
    await pool.query('ROLLBACK'); 
    console.log(error);
    return false;
  }
}

module.exports = { registerUser, queryAccount, insertRefreshToken, getRefreshToken, queryAccountUsername, checkCode, activeAccount, renewCode, insertConfirmationCode, updatePassword };