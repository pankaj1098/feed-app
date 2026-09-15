const userModel = require("../models/user.model");
const RevokedToken = require("../models/revoked-token.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("Missing JWT_SECRET in the environment.");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      jwtid: crypto.randomUUID(),
    },
  );
};

async function registerUsr(req, res) {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res
        .status(400)
        .json({ message: "userName, email and password are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      userName,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user" });
  }
}

async function loginUsr(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECREATE, {
    //   expiresIn: "7d",
    // });

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to login" });
  }
}

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res
        .status(400)
        .json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await userModel.findOne({ email: payload.email });

    if (!user) {
      user = await userModel.create({
        userName: payload.name,
        email: payload.email,
        googleId: payload.sub,
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid Google credential" });
  }
}

const logout = async (req, res) => {
  try {
    if (!req.auth?.tokenId || !req.auth?.expiresAt) {
      return res.status(400).json({
        message: "Authenticated token details are required",
      });
    }

    await RevokedToken.updateOne(
      {
        tokenId: req.auth.tokenId,
      },
      {
        $setOnInsert: {
          tokenId: req.auth.tokenId,
          expiresAt: req.auth.expiresAt,
        },
      },
      {
        upsert: true,
      },
    );

    return res.json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { registerUsr, loginUsr, googleLogin, logout };
