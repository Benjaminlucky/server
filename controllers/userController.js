import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import emailValidator from "email-validator";
import { sendVerificationEmail } from "../utils/emailUtils.js"; // Ensure you import correctly
import { authenticateToken } from "../middlewares/authMiddleware.js";
import generateVerificationToken from "../utils/generateVerificationToken.js";

// Register User
export const registerUser = async (req, res) => {
  const { fullName, username, email, phone, country, password } = req.body;

  try {
    // Validate input
    if (!fullName || !username || !email || !phone || !country || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if username or email already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      country,
      password: hashedPassword,
      isVerified: false, // User is not verified initially
    });

    // Define the payload with the user ID and other necessary info
    const payload = {
      userId: newUser._id, // The unique user ID
      email: newUser.email, // You can add more information to the payload if necessary
    };

    // Generate a verification token
    const verificationToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Save the verification token in the user object
    newUser.verificationToken = verificationToken;
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error during user registration:", error.message);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // No check for user verification
    // Remove this check to allow login regardless of verification status
    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     error: "Email not verified. Please verify your email to log in.",
    //     unverified: true, // Optional flag for frontend logic
    //   });
    // }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user_id: user._id,
      fullName: user.fullName,
      email: user.email,
      token,
      emailVerified: user.isVerified, // Send email verification status to frontend
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller function to get user by ID
export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // Send user data if found
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend Verification Email Controller

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    // Update the isVerified field and save
    user.isVerified = true;
    console.log("Before Save:", user); // Check if isVerified is set to true
    await user.save(); // Save the changes to the database
    console.log("After Save:", user);

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

// Resend verification email logic
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.user; // Get the user's email from the JWT payload (from middleware)

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Generate the verification token and send the email
    const verificationToken = generateVerificationToken(user);
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    console.error("Error resending verification email:", error.message);
    res.status(500).json({
      error: "Error resending verification email. Please try again later.",
    });
  }
};

// Verify email using the token from the query params
export const verifyUser = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token

    const user = await User.findById(decoded.userId); // Retrieve user from DB
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    user.isVerified = true; // Mark as verified
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email successfully verified." });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(400).json({ error: "Invalid or expired verification token." });
  }
};

// Get the user status (verified or not)

export const getUserStatus = async (req, res) => {
  try {
    // Get the token from the authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: "Authentication token is missing" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Using JWT_SECRET from environment

    // Find the user by the decoded token's user ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the user's verification status
    res.status(200).json({ isVerified: user.isVerified });
  } catch (error) {
    console.error("Error fetching user status:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the user status" });
  }
};
