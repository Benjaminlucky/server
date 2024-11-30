import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  resendVerificationEmail,
  verifyUser,
  getUserStatus,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Define routes
router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/user/:userId", getUser);
router.post("/resend-verification", authenticateToken, resendVerificationEmail); // Resend verification
router.get("/verify/:token", verifyUser); // Verify email using token
router.get("/verify-email", verifyUser); // Same as above, could be used for UI redirection
router.get("/user/status", authenticateToken, getUserStatus);

export default router;
