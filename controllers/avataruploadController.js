import multer from "multer";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Multer setup for file upload with file type and size validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/"); // Save the file in 'uploads/avatars/' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create unique filename based on timestamp
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image file types (png, jpg, jpeg)
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only jpg and png are allowed."), false);
    }
  },
});

// Avatar upload function
// Avatar upload function
const uploadAvatar = async (req, res) => {
  try {
    // Check if the file is provided
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get the token from the authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authentication token is missing" });
    }

    // Verify the token and get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the full URL for the avatar using the uploaded file name
    const avatarUrl = `${process.env.API_BASE_URL}/uploads/avatars/${req.file.filename}`;

    // Save the avatar URL to the user's profile image field in the database
    user.profileImage = avatarUrl;
    await user.save();

    // Respond with success and the avatar URL
    res.status(200).json({
      message: "Profile photo uploaded successfully",
      avatarUrl,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({
      error: "An error occurred while uploading the avatar",
    });
  }
};

// Export the upload and uploadAvatar functions
export { upload, uploadAvatar };
