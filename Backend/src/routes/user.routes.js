const express = require("express");
const { getProfile, updateProfile } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.patch("/me", authMiddleware, upload.single("avatar"), updateProfile);

module.exports = router;
