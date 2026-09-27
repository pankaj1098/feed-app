const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/revoked-token.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token is required",
      });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("Missing JWT_SECRET in the environment.");
    }

    const payload = jwt.verify(token, jwtSecret);

    if (!payload.sub || !payload.jti) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    const tokenId = payload.jti;

    if (!tokenId) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    const revokedToken = await RevokedToken.findOne({ tokenId }).lean();

    if (revokedToken) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
    };
    req.auth = {
      token,
      tokenId,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = authMiddleware;
