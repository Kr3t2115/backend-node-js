const pool = require('../../config/db');

// query if there is a user with the given email
const queryEmail = async (email) => {
  try {
    const result = await pool.query({
      rowMode: 'object',
      text: `SELECT * 
      FROM users 
      WHERE "email" = $1`,
      values: [email]
    });
  
    if(result.rowCount != 0){
      return true;
    }
    return false;
  } catch (error) {
    console.log(error)
    return false;
  }
  
}

// query to register a new user
const registerUser = async (registerData, hashedPassword) => {
  try {
    await pool.query('BEGIN');

    const { rows: [user] } = await pool.query(`INSERT INTO users (firstname, lastname, email, password) VALUES ('${registerData.firstname}', '${registerData.lastname}', '${registerData.email}', '${hashedPassword}') RETURNING id;`)

    await pool.query(`INSERT INTO wallet (balance, \"userId\") VALUES (10000, '${user.id}');`);

    await pool.query('COMMIT');
    return user.id;
  } catch (error) {
    return false;
  }
}

// query that registers the user's wallet
// const registerWallet = async (id) => {
//   const result = await pool.query({
//     rowMode: 'object',
//     text: ``
//   });

//   if(result.rowCount == 1){
//     return true;
//   }else{
//     return false;
//   }
// }

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

module.exports = {queryEmail, registerUser, queryAccount};