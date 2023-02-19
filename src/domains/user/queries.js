const pool = require('../../config/db')

const queryEmail = async (email) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT ID, firstname, lastname, email, password FROM users WHERE email='${email}'`
  })

  return result.rowCount;
}

const registerUser = async (registerData, hashedPassword) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO users (firstname, lastname, email, password) VALUES ('${registerData.firstname}', '${registerData.lastname}', '${registerData.email}', '${hashedPassword}');`
  })

  if(result.rowCount == 1){
    return true
  }else{
    return false
  }
  
}

const registerWallet = async (id) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `INSERT INTO wallet (balance, user_id) VALUES (10000, '${id}');`
  })

  if(result.rowCount == 1){
    return true
  }else{
    return false
  }
  
}

const queryAccount = async (email) => {
  const result = await pool.query({
    rowMode: 'object',
    text: `SELECT * FROM users WHERE email='${email}';`
  })

  if(result.rowCount == 1){
    return result.rows[0];
  }else{
    return false
  }
  
}


module.exports = {queryEmail, registerUser, queryAccount, registerWallet}
