const express = require("express");
const router = express.Router();

const loginRoute = require('./loginActions/login');
const registerRoute = require('./loginActions/register');
const checkEmailRoute = require('./loginActions/checkEmail');

// user login and registration routes
router.use("/login", loginRoute);
router.use("/register", registerRoute);
router.use("/check", checkEmailRoute);

module.exports = router;