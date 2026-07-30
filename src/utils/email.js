const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // fail fast if it can't connect within 10s
  greetingTimeout: 10000,   // fail fast if SMTP server doesn't greet within 10s
  socketTimeout: 15000,     // kill idle socket after 15s
  family: 4,                // force IPv4 — Render has no outbound IPv6 route,
                             // so Gmail's IPv6 address causes ENETUNREACH otherwise
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
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
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