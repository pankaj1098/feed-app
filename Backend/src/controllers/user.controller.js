const userModel = require("../models/user.model");
const uploadFile = require("../services/storage.services");

const PROFILE_FIELDS = ["fullName", "userName", "bio", "email", "location", "website"];
const SOCIAL_FIELDS = ["linkedin", "github", "twitter"];

async function getProfile(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile fetched successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch profile" });
  }
}

async function updateProfile(req, res) {
  try {
    const updates = {};

    for (const field of PROFILE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    for (const field of SOCIAL_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[`socialLinks.${field}`] = req.body[field];
      }
    }

    if (updates.email) {
      const existingEmail = await userModel.findOne({
        email: updates.email,
        _id: { $ne: req.user.id },
      });
      if (existingEmail) {
        return res.status(409).json({ message: "Email is already in use" });
      }
    }

    if (updates.userName) {
      const existingUserName = await userModel.findOne({
        userName: updates.userName,
        _id: { $ne: req.user.id },
      });
      if (existingUserName) {
        return res.status(409).json({ message: "Username is already taken" });
      }
    }

    if (req.file) {
      const result = await uploadFile(req.file.buffer);
      updates.avatar = { url: result.url, fileId: result.fileId };
    }

    const user = await userModel
      .findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true },
      )
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile updated successfully", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Email or username already in use" });
    }

    return res.status(500).json({ message: "Unable to update profile" });
  }
}

module.exports = { getProfile, updateProfile };
