import bcrypt from "bcrypt";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  const { fullName, username, email, phone, country, password } = req.body;

  try {
    // Validate input (example: ensure all fields are provided)
    if (!fullName || !username || !email || !phone || !country || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      country,
      password: hashedPassword, // Save hashed password
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
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

    // Login successful
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
