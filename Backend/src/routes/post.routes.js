const express = require("express");
const {
  createPost,
  getPosts,
  getMyPosts,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/create-post", authMiddleware, upload.single("image"), createPost);
router.get("/posts", getPosts);
router.get("/my-posts", authMiddleware, getMyPosts);
router.patch("/posts/:id", authMiddleware, upload.single("image"), updatePost);
router.delete("/posts/:id", authMiddleware, deletePost);

module.exports = router;
