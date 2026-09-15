const express = require("express");
const {
  registerUsr,
  loginUsr,
  googleLogin,
  logout,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerUsr);
router.post("/login", loginUsr);
router.post("/google", googleLogin);
router.post("/logout", authMiddleware, logout);

module.exports = router;
