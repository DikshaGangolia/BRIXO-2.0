const nodemailer = require("nodemailer");

const sendEmail = async (to, productName) => {
  try {
    console.log("EMAIL USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL PASS:",
      process.env.EMAIL_PASS ? "Loaded" : "Missing"
    );

    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "BRIXO Order Confirmation",
      text: `Your order for ${productName} has been received successfully. Thank you for shopping with BRIXO!`,
    });

    console.log("EMAIL SENT SUCCESSFULLY");

  } catch (error) {
    console.log("EMAIL ERROR:", error.message);
    throw error;
  }
};

module.exports = sendEmail;