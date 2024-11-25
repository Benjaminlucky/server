import express from "express";
import { verifyUser } from "../controllers/authController.js";
import { verifyEmail } from "../controllers/userController.js";

const router = express.Router();

/**
 * @route   GET /api/auth/verify
 * @desc    Verify a user's email
 * @access  Public
 */
router.get("/verify/:token", verifyUser); // Add the verification route
router.get("/verify-email", verifyEmail);

export default router;
