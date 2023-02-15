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

const validateRegister = (req) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password){
        return 100;
      }else if(req.body.password.length < 8){
        return 101;
      }else if(req.body.firstname.length < 3 || req.body.lastname.length < 3){
        return 102;
      }else if(!emailRegex.test(req.body.email)){
        return 103;
      }
}

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);

    const hash = bcrypt.hashSync(password, salt);

    return hash;
}

const checkPasswords = (hash) => {
    if (bcrypt.compareSync("12342s1211", hashedPassword)) {
        console.log('Użytkownik został zalogowany.');
      } else {
        console.log('Nieprawidłowe hasło.');
      }
}


module.exports = { checkPassword, validateRegister, hashPassword }