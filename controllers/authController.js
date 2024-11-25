import User from "../models/User.js";

// Verify User
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

// Resend Verification Email
