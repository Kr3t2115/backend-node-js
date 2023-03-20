const express = require("express");
const router = express.Router();

const loginRoute = require('./loginActions/login');
const registerRoute = require('./loginActions/register');

// user login and registration routes
router.use("/login", loginRoute);
router.use("/register", registerRoute)

module.exports = router;