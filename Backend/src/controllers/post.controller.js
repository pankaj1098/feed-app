const postModel = require("../models/post.model");
const uploadFile = require("../services/storage.services");

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

// Tags arrive from FormData as a JSON array string, but a comma separated
// string is accepted too. Stored lowercase without the leading "#".
function parseTags(raw) {
  if (raw === undefined) return undefined;
  let list = raw;
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw);
    } catch {
      list = raw.split(",");
    }
  }
  if (!Array.isArray(list)) list = [list];

  const tags = list
    .map((tag) =>
      String(tag)
        .trim()
        .replace(/^#+/, "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, MAX_TAG_LENGTH),
    )
    .filter(Boolean);
  return [...new Set(tags)].slice(0, MAX_TAGS);
}

function parseCategory(raw) {
  if (raw === undefined) return undefined;
  return String(raw).trim().slice(0, 30);
}

// Array.from splits by code point so a multi-unit emoji is never cut in half.
function parseEmoji(raw) {
  if (raw === undefined) return undefined;
  return Array.from(String(raw).trim()).slice(0, 8).join("");
}

async function createPost(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "An image is required" });
  }


  try {
    const result = await uploadFile(req.file.buffer);
    const post = await postModel.create({
      image: result.url,
      caption: req.body.caption,
      description: req.body.description,
      category: parseCategory(req.body.category) || "",
      tags: parseTags(req.body.tags) || [],
      emoji: parseEmoji(req.body.emoji) || "",
      author: req.user.id,
    });
    await post.populate("author", "userName avatar");
    return res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unable to create post" });
  }
}

async function getPosts(req, res) {
  try {
    const posts = await postModel
      .find()
      .sort({ createdAt: -1 })
      .populate("author", "userName avatar");
    return res
      .status(200)
      .json({ message: "Posts fetched successfully", posts });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch posts" });
  }
}

async function getMyPosts(req, res) {
  try {
    const posts = await postModel
      .find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate("author", "userName avatar");
    return res
      .status(200)
      .json({ message: "Posts fetched successfully", posts });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch posts" });
  }
}

async function updatePost(req, res) {
  try {
    const post = await postModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts" });
    }

    if (req.body.caption !== undefined) post.caption = req.body.caption;
    if (req.body.description !== undefined)
      post.description = req.body.description;
    const category = parseCategory(req.body.category);
    if (category !== undefined) post.category = category;
    const tags = parseTags(req.body.tags);
    if (tags !== undefined) post.tags = tags;
    const emoji = parseEmoji(req.body.emoji);
    if (emoji !== undefined) post.emoji = emoji;

    if (req.file) {
      const result = await uploadFile(req.file.buffer);
      post.image = result.url;
    }

    await post.save();
    await post.populate("author", "userName avatar");

    return res
      .status(200)
      .json({ message: "Post updated successfully", post });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid post id" });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unable to update post" });
  }
}

async function deletePost(req, res) {
  try {
    const post = await postModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid post id" });
    }
    return res.status(500).json({ message: "Unable to delete post" });
  }
}

module.exports = {
  createPost,
  getPosts,
  getMyPosts,
  updatePost,
  deletePost,
};
