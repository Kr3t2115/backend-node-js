const jwt = require("jsonwebtoken");

// function that verifies the user's jwt token
const verifyToken = (req, res, next) => {
  const token = req.cookies.ACCESS_TOKEN;
  console.log(token)
  if (token == null){
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
    if (err) 
      return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = verifyToken;