import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendOtpMail = async (to, otp, first_name) => {
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const info = await transporter.sendMail({
    from: '"Event Flex" <team.aditya.invincible@gmail.com>',

    to,
    subject: "Reset your Password",
    html: ` <h2>Hi ${first_name},</h2> 
    <p>Your OTP for password reset is <b>${otp}. </b></br>Its ${time} now and the OTP is valid for 5 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    <br/>
    <p>Best Regards,<br/>Event Flex Team</p>`,
  });

  console.log("Message sent:", info.messageId);
};
export { sendOtpMail };
