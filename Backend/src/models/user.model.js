const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
    avatar: { url: String, fileId: String },
    fullName: { type: String, trim: true },
    bio: { type: String, maxlength: 150, trim: true },
    location: { type: String, trim: true },
    website: { type: String, trim: true },
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
    },
  },
  { timestamps: true },
);

const userModule = mongoose.model("user", userSchema);

module.exports = userModule;
