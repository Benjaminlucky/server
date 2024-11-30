import postmark from "postmark";

// Create a Postmark client
const postmarkApiKey =
  process.env.POSTMARK_API_KEY || "be326a40-1bb6-485b-8ea1-52be241a2bec";
const client = new postmark.ServerClient(postmarkApiKey);

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    // Dynamically set the base URL based on the environment
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://alliancefxmarket.onrender.com" // Replace with your production URL
        : "http://localhost:3000"; // Use localhost in development

    const verificationUrl = `${baseUrl}/user/verify-email?token=${verificationToken}`;

    const result = await client.sendEmail({
      From: "info@glamandessence.com", // Must be a verified sender
      To: email,
      Subject: "Please verify your email",
      TextBody: `Click the link below to verify your email:\n\n${verificationUrl}`,
      HtmlBody: `<p>Click the link below to verify your email:</p><p><a href="${verificationUrl}">Verify Email</a></p>`,
    });

    console.log("Verification email sent successfully:", result);
    return result; // Optional, useful for testing or logging
  } catch (error) {
    console.error("Error sending verification email:", error.message);

    // Handle Postmark-specific error
    if (
      error.message.includes("inactive") ||
      error.message.includes("inactive addresses")
    ) {
      throw new Error(
        "The email address is inactive or unable to receive emails."
      );
    }

    // Default error handling
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};
