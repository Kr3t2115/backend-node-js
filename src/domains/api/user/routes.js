const express = require("express");
const router = express.Router();
const { getUser } = require('./queries');

/**
 * GET /api/user/logout
 * @summary User logout route
 * @tags login
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "logout": "wylogowano"
 * }
 */
/**
 * GET /api/user/ping
 * @summary Funny ping pong function
 * @tags ping
 * @return {object} 200 - success response - application/json
 * @example response - 200 - example success response
 * {
 *  "response": "pong"
 * }
 */
// function that logut user
router.get("/logout", (req, res) => {
  res.clearCookie('ACCESS_TOKEN', {sameSite: "none", secure: true});
  res.clearCookie('REFRESH_TOKEN', {sameSite: "none", secure: true});
  res.json({
    "logout": "wylogowano"
  });
});

router.get("/", async (req, res) => {
    const user = await getUser(req.user.id);
    res.status(200).json(user);
})

// funny ping pong answer function
router.get("/ping", (req, res) => {
  res.status(200).json({
    "response": "pong"
  });
});

module.exports = router;