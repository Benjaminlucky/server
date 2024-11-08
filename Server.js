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
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err.message);
  });

// After app is created
app.use(
  cors({
    origin: ["http://localhost:5173"], // Allow both origins
    credentials: true,
  })
);

app.use(express.json());

app.use("/user", userRoutes); // Matches the URL in Axios request

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
