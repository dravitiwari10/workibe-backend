const nodemailer = require("nodemailer");

// Using Resend's SMTP relay instead of Gmail — same nodemailer code style,
// but with a provider that has reliable IPv4 endpoints (Gmail's SMTP
// resolves to IPv6 addresses that Render can't route outbound traffic to).
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true, // 465 = implicit TLS
  auth: {
    user: "resend", // literally the string "resend" — not your email
    pass: process.env.RESEND_API_KEY, // your Resend API key, e.g. re_xxxxx
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verify the connection once on startup so config problems show up
// immediately in your logs, instead of only on the first real send.
transporter.verify((err, success) => {
  if (err) {
    console.error("[email] SMTP transporter verification FAILED:", err.message);
  } else {
    console.log("[email] SMTP transporter is ready to send messages");
  }
});

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
    // process.env.SMTP_FROM should be either the Resend test address
    // (onboarding@resend.dev) or an address on a domain you've verified
    // in the Resend dashboard, e.g. "workibe <noreply@yourdomain.com>"
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "onboarding@resend.dev",
      to: email,
      subject: copy.subject,
      html,
    });
    console.log(`[email] OTP email sent to ${email} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[email] Failed to send OTP email to ${email}:`, err.message);
    throw err;
  }
};

module.exports = { sendOtpEmail };