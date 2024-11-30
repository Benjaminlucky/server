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

const allowedOrigins = [
  "http://localhost:5173", // For local development
  "https://alliancefxmarket.netlify.app", // Production frontend
];
// CORS setup
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: "Authorization,Content-Type",
    credentials: true, // If you're using cookies or authorization headers
  })
);
// Middleware to parse incoming requests
app.use(express.json());

// Root route for testing
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// User routes
app.use("/user", userRoutes);

// Authentication routes
app.use("/auth", authRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
