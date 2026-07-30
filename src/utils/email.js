const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const OTP_COPY = {
  verify_email: {
    subject: "Verify your email",
    heading: "Verify your email address",
    body: "Use the code below to verify your email address.",
  },
  reset_password: {
    subject: "Reset your password",
    heading: "Reset your password",
    body: "Use the code below to reset your password.",
  },
};

// purpose: "verify_email" | "reset_password"
const sendOtpEmail = async (email, code, purpose = "verify_email", name = "") => {
  const copy = OTP_COPY[purpose] || OTP_COPY.verify_email;
  const greeting = name ? `Hi ${name},` : "Hi,";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${copy.heading}</h2>
      <p>${greeting}</p>
      <p>${copy.body}</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 24px 0;">
        ${code}
      </p>
      <p>This code expires shortly. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    // process.env.RESEND_FROM should be either the Resend test address
    // (onboarding@resend.dev) or an address on a domain you've verified
    // in the Resend dashboard, e.g. "workibe <noreply@yourdomain.com>"
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "onboarding@resend.dev",
      to: email,
      subject: copy.subject,
      html,
    });

    if (error) {
      throw new Error(error.message || "Resend API returned an error");
    }

    console.log(`[email] OTP email sent to ${email} — id: ${data?.id}`);
    return data;
  } catch (err) {
    console.error(`[email] Failed to send OTP email to ${email}:`, err.message);
    throw err;
  }
};

module.exports = { sendOtpEmail };