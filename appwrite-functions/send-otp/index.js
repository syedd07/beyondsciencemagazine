// Appwrite Function: sendOtpEmail
// Sends OTP email via Mailgun SMTP without external packages

const net = require("net");
const tls = require("tls");

module.exports = async function (req, res) {
  const { email, otp } = JSON.parse(req.payload);

  const smtpHost = process.env.MAILGUN_SMTP_HOST;
  const smtpUser = process.env.MAILGUN_SMTP_USER;
  const smtpPass = process.env.MAILGUN_SMTP_PASS;
  const from = process.env.MAILGUN_FROM_EMAIL;

  const message = [
    `EHLO ${smtpHost}`,
    "AUTH LOGIN",
    Buffer.from(smtpUser).toString("base64"),
    Buffer.from(smtpPass).toString("base64"),
    `MAIL FROM:<${from}>`,
    `RCPT TO:<${email}>`,
    "DATA",
    `Subject: Your One-Time Password (OTP)
MIME-Version: 1.0
Content-Type: text/html

To: ${email}
From: ${from}

<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Your Verification Code</h2>
    <p>Dear user,</p>
    <p>Your One-Time Password (OTP) is:</p>
    <h3 style="color: #2e6da4;">${otp}</h3>
    <p>Please enter this code to verify your email address. This code is valid for the next 5 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    <br />
    <p style="font-size: 14px;">Regards,<br />Beyond Science Magazine</p>
  </body>
</html>`,
    ".",
    "QUIT",
  ];

  const sendSMTP = () => {
    return new Promise((resolve, reject) => {
      const socket = tls.connect(
        587,
        smtpHost,
        { rejectUnauthorized: false },
        () => {
          let i = 0;
          socket.on("data", () => {
            if (i < message.length) {
              socket.write(message[i++] + "\r\n");
            } else {
              socket.end();
              resolve();
            }
          });
        }
      );

      socket.on("error", (err) => {
        reject(err);
      });
    });
  };

  try {
    await sendSMTP();
    res.send(`OTP sent to ${email}`);
  } catch (err) {
    res.send(`Error sending OTP: ${err.message}`);
  }
};
