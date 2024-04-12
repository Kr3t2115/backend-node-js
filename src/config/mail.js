const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@trycrypto.pl",
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

module.exports = transporter;