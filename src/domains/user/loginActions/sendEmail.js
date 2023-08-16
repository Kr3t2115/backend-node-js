const transporter = require('./../../../config/mail');

// Send email function for welcome new user
const sendWelcomeEmail = (recipient, username) => {
  return new Promise((resolve, reject) => {
  const mailOptions = {
    from: "noreply@trycrypto.pl",
    to: recipient,
    subject: 'Welcome to trycrypto.pl',
    html: 
`
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Confirmed</title>
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
    <h1 style="font-size: 40px; text-align: center;">Account Confirmed!</h1>
    <p style="color: #323232">Dear ${username},</p>
    <p style="color: #323232">Congratulations! Your account on Our Website has been successfully confirmed.</p>
    <p style="color: #323232">You are now part of our growing community, and we're thrilled to have you with us.</p>
    <p style="color: #323232">Feel free to explore our platform and enjoy all the exciting features we offer.</p>
    <p style="color: #323232">If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
    <p style="color: #323232">Thank you for choosing Our Website. We look forward to seeing you around!</p>
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

// Send email function for send account confirmation code
const sendConfirmEmail = (recipient, code) => {
  return new Promise((resolve, reject) => {
  const mailOptions = {
    from: "noreply@trycrypto.pl",
    to: recipient,
    subject: 'Account confirmation',
    html: 
`
<html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email confirmation</title>
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
    <h1 style="font-size: 40px; text-align: center;">Account Confirmation</h1>
    <p style="color: #323232">Thank you for registering on our website! To confirm your account, please enter the following code on our platform:</p>
    <p style="color: black; font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;">${code}</p>
    <p style="color: #323232">If you did not create an account, please ignore this message.</p>
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

module.exports = {sendConfirmEmail, sendWelcomeEmail};