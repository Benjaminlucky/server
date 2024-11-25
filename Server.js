import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err.message);
  });

// CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://alliancefxmarket.netlify.app", // Deployed frontend URL (no trailing slash)
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow cookies or authentication credentials
  })
);

// Handle preflight requests for CORS
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.sendStatus(204); // No Content
});

// Middleware to parse incoming requests
app.use(express.json());

// Root route for testing
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Route to get user data by ID

// User routes (non-authenticated routes like profile, settings)
app.use("/user", userRoutes);

// Authentication routes (signup, signin)
app.use("/auth", authRouter); // Change /user to /auth for authentication routes

app.get("/user/:userId", (req, res) => {
  const userId = req.params.userId;
  // Fetch user from database using userId
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
