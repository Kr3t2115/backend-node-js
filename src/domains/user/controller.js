const jwt = require('jsonwebtoken');

const checkPassword = (password, hashedPassword, res) => {

    if(password == hashedPassword){
        
    }

    const ACCESS_KEY = process.env.ACCESS_KEY;
    const payload = {'password': password};
    console.log(ACCESS_KEY)
    const token = jwt.sign(payload, ACCESS_KEY, {expiresIn: '30m'})
    res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + 3000000)})
    res.send("xd")
    console.log("dsadsa" + password, hashedPassword[0].password)
}

module.exports = checkPassword;