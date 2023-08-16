const transporter = require('../../../config/mail');

// Send email function for password reset confirmation
const sendInformationMail = (recipient, username) => {
  return new Promise((resolve, reject) => {
  const mailOptions = {
    from: "noreply@trycrypto.pl",
    to: recipient,
    subject: 'Reset password confirmation',
    html: 
`
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
        padding: 20px;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #ecbe04;
      }

      p {
        margin-bottom: 20px;
      }

      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #ecbe04;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 style="font-size: 40px; text-align: center;">Password Reset Confirmation</h1>
      <p style="color: #323232">Dear ${username},</p>
      <p style="color: #323232">Your password has been successfully reset. If you initiated this password reset, no further action is required.</p>
      <p style="color: #323232">If you did not request this password reset, please contact our support team immediately.</p>
      <p style="color: #323232">Best regards,<br>Our Website Team</p>
      <p style="text-align: center;"><a class="button" style="color: white;" href="https://trycrypto.pl">Visit Our Website</a></p>
    </div>
  </body>
</html>`,
  };

  // Send email function
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      reject(error);
    } else {
      resolve(info.response);
    }
  });
});
};

// Send email function for password reset code 
const sendConfirmEmail = (recipient, code, username) => {
  return new Promise((resolve, reject) => {
  const mailOptions = {
    from: "noreply@trycrypto.pl",
    to: recipient,
    subject: 'Reset password request',
    html: 
`
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
        padding: 20px;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      h1 {
        color: #ecbe04;
      }

      p {
        margin-bottom: 20px;
      }

      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #ecbe04;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 style="font-size: 40px; text-align: center;">Reset Password Confirmation</h1>
      <p style="color: #323232">Dear ${username},</p>
      <p style="color: #323232">We received a request to reset your password for your account on our website. To proceed with the password reset, please use the following code:</p>
      <p style="color: black; font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;">${code}</p>
      <p style="color: #323232">If you didn't initiate this password reset, please disregard this message.</p>
      <p style="color: #323232">Best regards,<br>Our Website Team</p>
      <p style="text-align: center;"><a class="button" style="color: white;" href="https://trycrypto.pl">Visit Our Website</a></p>
    </div>
  </body>
</html>`,
  };

  // Send email function
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      reject(error);
    } else {
      resolve(info.response);
    }
  });
});
};

module.exports = { sendConfirmEmail, sendInformationMail }