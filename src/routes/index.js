const express = require("express");
const router = express.Router();

const apiRoutes = require("../domains/api/routes");
const userRoutes = require("../domains/user/routes");
const iconRoutes = require("../domains/icons/routes.js")
const verifyToken = require("../services/verifyToken");

router.use("/user", userRoutes);
router.use("/icon", iconRoutes)
// secured route by verifying the jwt token
router.use(verifyToken);
router.use("/api", apiRoutes);


module.exports = router; 