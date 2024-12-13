import express from "express";
import { upload, uploadAvatar } from "../controllers/avataruploadController.js";
import {
  registerUser,
  loginUser,
  getUser,
  resendVerificationEmail,
  verifyUser,
  getUserStatus,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { getUserProfileImage } from "../controllers/getProfileimg.js";

const router = express.Router();

// User routes
router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/user/:userId", authenticateToken, getUser); // Added authentication for user details
router.post("/resend-verification", authenticateToken, resendVerificationEmail);
router.get("/verify/:token", verifyUser);
router.get("/verify-email", verifyUser);
router.get("/status", authenticateToken, getUserStatus);

// Avatar upload route
router.post(
  "/upload-avatar",
  authenticateToken,
  upload.single("avatar"),
  uploadAvatar
);

router.get("/profile", authenticateToken, getUserProfileImage);

export default router;
