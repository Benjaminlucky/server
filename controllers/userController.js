import User from "../models/User.js"; // Import the User model

const registerUser = async (req, res) => {
  const { fullName, username, email, phone, country, password } = req.body;

  console.log("Request body:", req.body); // Log to verify received data

  try {
    // Check if the username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Check if the email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create a new user if the username and email are unique
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      country,
      password,
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error); // Log the error
    if (error.name === "ValidationError") {
      const formattedErrors = Object.values(error.errors)
        .map((err) => err.message) // Get the validation error messages
        .join(", "); // Join them into a single string
      return res.status(400).json({ error: formattedErrors });
    }
    return res
      .status(500)
      .json({ error: error.message || "Failed to register user" });
  }
};

export default registerUser;
