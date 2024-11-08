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

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://alliancefxmarket.netlify.app/", // Replace with your deployed frontend URL
    ],
    credentials: true,
  })
);

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// User routes
app.use("/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
