const express = require("express");
const router = express.Router();

const loginRoute = require('./loginActions/login');
const registerRoute = require('./loginActions/register');
const checkEmailRoute = require('./loginActions/checkEmail');
const confirmEmailRoute = require('./loginActions/confirmEmail');
const resendEmailRoute = require('./loginActions/resendConfirmEmail');
const refreshTokenRoute = require('./loginActions/refreshToken');
const resetPasswordSendCode = require('./password/resetPasswordCode');
const resetPassword = require('./password/resetPassword');
const checkCode = require('./password/checkCode');

// user login and registration routes
router.use("/login", loginRoute);
router.use("/register", registerRoute);
router.use("/check", checkEmailRoute);
router.use("/refresh", refreshTokenRoute);
router.use("/confirm", confirmEmailRoute);
router.use("/confirm", resendEmailRoute);
router.use("/reset", resetPasswordSendCode);
router.use("/reset", resetPassword);
router.use("/reset", checkCode);

module.exports = router;