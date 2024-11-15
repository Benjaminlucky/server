import bcrypt from "bcryptjs";
import User from "../models/User.js";

const registerUser = async (req, res) => {
  console.log("registerUser function called");
  console.log("Register User endpoint hit"); // Debugging statement
  const { fullName, username, email, phone, country, password } = req.body;
  console.log("Received data:", req.body); // Log the incoming data

  try {
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
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log("Hashed Password:", hashedPassword); // Check hashed password
    // Create and save the new user
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      country,
      password: hashedPassword, // Save the hashed password
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error); // Log any errors
    res.status(500).json({ error: "Failed to register user" });
  }
};
export default registerUser;

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Received data:", req.body);

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for:", email);
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Login successful
    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
