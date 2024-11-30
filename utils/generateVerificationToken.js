import jwt from "jsonwebtoken";

function generateVerificationToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
}

export default generateVerificationToken;
