const express = require("express");
const router = express.Router();

const loginRoute = require('./loginActions/login');
const registerRoute = require('./loginActions/register');
const checkEmailRoute = require('./loginActions/checkEmail');
const confirmEmailRoute = require('./loginActions/confirmEmail');
const resendEmailRoute = require('./loginActions/resendConfirmEmail');
const refreshTokenRoute = require('./loginActions/refreshToken');

// user login and registration routes
router.use("/login", loginRoute);
router.use("/register", registerRoute);
router.use("/check", checkEmailRoute);
router.use("/refresh", refreshTokenRoute);
router.use("/confirm", confirmEmailRoute);
router.use("/confirm", resendEmailRoute);

module.exports = router;