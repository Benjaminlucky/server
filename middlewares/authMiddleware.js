import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to authenticate the user by verifying JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is required." });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    // Find the user by the decoded user ID and add it to the request object
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = user; // Attach user to the request object for later use
    next();
  });
};
