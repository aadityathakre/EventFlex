import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },

});


 const sendOtpMail = async (to, otp) => {
  const info = await transporter.sendMail({
    from: '"Aditya Thakre" <adityathakre976@gmail.com>',

    to,
    subject: "Reset your Password",
    html: `<p>Your OTP for password reset is <b>${otp} </b>, It will expire in 5 minutes. </p>`, 
  });

  console.log("Message sent:", info.messageId);
}
export {sendOtpMail};