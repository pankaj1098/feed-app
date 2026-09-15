const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  image: String,
  caption: String,
  description: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
}, { timestamps: true });

const postModel = mongoose.model("post", postSchema);

module.exports = postModel;
