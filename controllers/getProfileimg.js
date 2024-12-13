// userController.js
import User from "../models/User.js"; // assuming you are using Mongoose for user model

// Function to get user's profile image
export const getUserProfileImage = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user ID in request from authentication middleware
    const user = await User.findById(userId).select("profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send profile image URL (assuming it's a URL or path to an image)
    return res.status(200).json({ profileImage: user.profileImage });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
