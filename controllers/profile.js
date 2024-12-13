import express from "express";
import User from "../models/userModel";

const router = express.Router();

// Route to fetch user data including the profile image
router.get("/userProfile", async (req, res) => {
  try {
    const user = await User.findById(req.userId); // Assuming userId is in req.userId
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      fullName: user.fullName,
      username: user.username,
      profileImage: user.profileImage, // Send profile image URL
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update the profile image
router.put("/updateProfileImage", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profileImage = req.body.profileImage; // Expecting the new profile image URL
    await user.save();
    res.json({ message: "Profile image updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
