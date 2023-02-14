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

module.exports = queryLoginUser, queryUsers;
