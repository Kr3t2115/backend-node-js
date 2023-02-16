const pool = require('../../config/db')

const queryUsers = (callback) => {
  pool.query('SELECT * FROM users', (error, result) => {
    if (error) {
      callback(result)
    }
    callback(null, result)
  })
}

const queryLoginUser = (email, callback) => {
  pool.query(`SELECT ID, firstname, lastname, email, password FROM users WHERE email='${email}'`, (error, result) => {
    if (error) { 
      callback(result)
    }
    callback(null, result)
  })
}

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


module.exports = {queryLoginUser, queryUsers, queryEmail, registerUser, queryAccount}
