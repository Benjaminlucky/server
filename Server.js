import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err.message);
  });

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://your-frontend-url.com", // Replace with your deployed frontend URL
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/user", userRoutes);

// Bind to the dynamic port or default to 3000 for local development
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
