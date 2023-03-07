const pool = require('../../config/db');

// query if there is a user with the given email
const queryEmail = async (email) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM users WHERE email='${email}'`
  });

  if(result.rowCount != 0){
    return true;
  }else{
    return false;
  }
}

// query to register a new user
const registerUser = async (registerData, hashedPassword) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO users (firstname, lastname, email, password) VALUES ('${registerData.firstname}', '${registerData.lastname}', '${registerData.email}', '${hashedPassword}');`
  });

  if(result.rowCount == 1){
    return true;
  }else{
    return false;
  }
}

// query that registers the user's wallet
const registerWallet = async (id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO wallet (balance, \"userId\") VALUES (10000, '${id}');`
  });

  if(result.rowCount == 1){
    return true;
  }else{
    return false;
  }
}

// query a user account
const queryAccount = async (email) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM users WHERE email='${email}';`
  });

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false;
  }
}

module.exports = {queryEmail, registerUser, queryAccount, registerWallet};