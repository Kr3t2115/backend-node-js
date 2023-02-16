const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const checkPassword = (password, hashedPassword, res) => {
    const ACCESS_KEY = process.env.ACCESS_KEY;
    const payload = {'password': password};
    console.log(ACCESS_KEY)
    const token = jwt.sign(payload, ACCESS_KEY, {expiresIn: '12h'})
    res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + 72000000)})
    res.send("xd")
    console.log("dsadsa" + password, hashedPassword[0].password)
}

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
}

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);

    const hash = bcrypt.hashSync(password, salt);

    return hash;
}

const generateJWT = (email) => {
  const token = jwt.sign({
    'email': email
  }, 
  process.env.ACCESS_KEY, 
  {expiresIn: '12h'})
  return token;
  
}

const validateLogin = (loginData) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!loginData.email || !loginData.password){
      return 150;
    }else if(loginData.password.length < 8){
      return 151;
    }else if(!emailRegex.test(loginData.email)){
      return 152;
  }
}

const comparePassword = (password, hashedPassword) => {
    if (bcrypt.compareSync(password, hashedPassword)) {
        return true;
      } else {
        return false;
      }
}


module.exports = { checkPassword, validateRegister, hashPassword, generateJWT, validateLogin, comparePassword }