import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/emailUtils.js"; // Ensure you import correctly

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
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1 day expiration
    );

    // Send the token and user data back
    res.status(200).json({
      success: true,
      message: "Login successful",
      user_id: user._id, // Store this in localStorage in frontend
      fullName: user.fullName,
      token, // Optionally store the token for authentication in future requests
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
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ error: "User is already verified" });
    }

    // Generate new verification token
    const payload = { userId: user._id, email: user.email };
    const verificationToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Update the user's verification token
    user.verificationToken = verificationToken;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    console.error("Error resending verification email:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyUser = async (req, res) => {
  const { token } = req.query; // Token from the URL query parameter

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded user ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Update the user's isVerified status to true
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    console.error("Error during user verification:", error.message);
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

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
