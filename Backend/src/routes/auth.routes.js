const express = require("express");
const {
  registerUsr,
  loginUsr,
  forgotPassword,
  resetPassword,
  googleLogin,
  logout,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", registerUsr);
router.post("/login", loginUsr);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);
router.post("/logout", authMiddleware, logout);

module.exports = router;
