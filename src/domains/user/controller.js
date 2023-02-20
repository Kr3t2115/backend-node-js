const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// function responsible for data validation, accepts an object containing data from the request, if error returns error code
const validateRegister = (registerData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!registerData.firstname || !registerData.lastname || !registerData.email || !registerData.password){
        return 100;
      }else if(registerData.password.length < 8 || !registerData.password.match(/\d/) || !registerData.password.match(/[a-z]/) || !registerData.password.match(/[A-Z]/)){
        return 101;
      }else if(registerData.firstname.length < 3 || registerData.lastname.length < 3){
        return 102;
      }else if(!emailRegex.test(registerData.email)){
        return 103;
      }

    return false;
}

//function responsible for hashing the password with bcrypt
const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);

    const hash = bcrypt.hashSync(password, salt);

    return hash;
}

// function generating the jwt token, accept email and id, returns a token
const generateJWT = (email, id) => {
  const token = jwt.sign({
    'email': email,
    'id': id
  }, 
  process.env.ACCESS_KEY, 
  {
    expiresIn: '12h'
  })

  return token;
}

// login data validation function, accepts an object with login data, returns an error code
const validateLogin = (loginData) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!loginData.email || !loginData.password){
      return 150;
    }else if(loginData.password.length < 8){
      return 151;
    }else if(!emailRegex.test(loginData.email)){
      return 152;
  }
  
  return false;
}

// function that compares password to password hash, takes password and hashed password
const comparePassword = (password, hashedPassword) => {
    if (bcrypt.compareSync(password, hashedPassword)) {
        return true;
      } else {
        return false;
      }
}

module.exports = { validateRegister, hashPassword, generateJWT, validateLogin, comparePassword }