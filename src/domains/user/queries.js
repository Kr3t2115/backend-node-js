const pool = require('../../config/db');

// new user registration function
const registerUser = async (firstname, lastname, email, hashedPassword) => {
  try {
    await pool.query('BEGIN');

    const { rows: [user] } = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO users ("firstname", "lastname", "email", "password") 
      VALUES ($1, $2, $3, $4) 
      RETURNING id;`,
      values: [firstname, lastname, email, hashedPassword]
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

const insertRefreshToken = async (token) => {
  try{
    const result = await pool.query({
      rowMode: 'object',
      text: `INSERT INTO refresh_tokens
      (token) VALUES
      ($1)`,
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

module.exports = { registerUser, queryAccount, insertRefreshToken, getRefreshToken };