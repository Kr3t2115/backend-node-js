const express = require("express");
const router = express.Router();

const loginRoute = require('./loginActions/login');
const registerRoute = require('./loginActions/register');
const checkEmailRoute = require('./loginActions/checkEmail');
const refreshTokenRoute = require('./loginActions/refreshToken');

// user login and registration routes
router.use("/login", loginRoute);
router.use("/register", registerRoute);
router.use("/check", checkEmailRoute);
router.use("/refresh", refreshTokenRoute);

module.exports = router;