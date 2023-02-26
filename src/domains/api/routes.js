const express = require("express");
const router = express.Router();
const userApiRoutes = require("./user/routes");
const walletApiRoutes = require("./wallet/routes");
const spotApiRoutes = require("./spot/routes");
const positionsApiRoutes = require("./positions/routes")

router.use("/user", userApiRoutes);
router.use("/wallet", walletApiRoutes);
router.use("/spot", spotApiRoutes);
router.use("/positions", positionsApiRoutes)

module.exports = router;