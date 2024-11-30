import postmark from "postmark";

// Create a Postmark client
const postmarkApiKey =
  process.env.POSTMARK_API_KEY || "be326a40-1bb6-485b-8ea1-52be241a2bec";
const client = new postmark.ServerClient(postmarkApiKey);

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const result = await client.sendEmail({
      From: "info@glamandessence.com", // Must be a verified sender
      To: email,
      Subject: "Please verify your email",
      TextBody: `Click the link below to verify your email:\n\nhttp://localhost:3000/user/verify-email?token=${verificationToken}`,
      HtmlBody: `<p>Click the link below to verify your email:</p><p><a href="http://localhost:3000/user/verify-email?token=${verificationToken}">Verify Email</a></p>`,
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
