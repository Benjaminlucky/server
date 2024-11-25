import express from "express";
import {
  registerUser,
  loginUser,
  getUser,
  resendVerificationEmail,
  verifyEmail,
  verifyUser,
} from "../controllers/userController.js";

const router = express.Router();

// Define routes
router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/user/:userId", getUser);
router.post("/resend-verification", resendVerificationEmail);
router.get("/verify/:token", verifyUser); // Add the verification route
router.get("/verify-email", verifyUser);

export default router;
