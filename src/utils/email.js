const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: copy.subject,
    html,
  });
};

module.exports = { sendOtpEmail };