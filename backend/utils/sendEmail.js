const nodemailer = require("nodemailer");

const sendEmail = async (to, productName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "BRIXO Order Confirmation",
    text: `Your order for ${productName} has been received successfully. Thank you for shopping with BRIXO!`,
  });
};

module.exports = sendEmail;