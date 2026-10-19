const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  image: String,
  caption: String,
  description: String,
  category: { type: String, trim: true, maxlength: 30, default: "" },
  tags: { type: [String], default: [] },
  emoji: { type: String, trim: true, default: "" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
}, { timestamps: true });

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
