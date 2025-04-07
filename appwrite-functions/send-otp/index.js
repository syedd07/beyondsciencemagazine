const net = require("net");
const tls = require("tls");
const sdk = require("node-appwrite");

module.exports = async function (req, res) {
  const { email } = JSON.parse(req.payload);

  if (!email || !email.includes('@')) {
    return res.send("Invalid email address");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Appwrite setup
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new sdk.Databases(client);

  // Save OTP to Appwrite DB
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry

  try {
    await databases.createDocument(
      process.env.APPWRITE_DB_ID,
      process.env.APPWRITE_COLLECTION_ID,
      'unique()', // auto ID
      {
        email,
        otp,
        expiresAt,
      }
    );
  } catch (err) {
    return res.send("Failed to save OTP to DB: " + err.message);
  }

  // SMTP Config
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

<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <h2>Your Verification Code</h2>
    <p>Dear user,</p>
    <p>Your One-Time Password (OTP) is:</p>
    <h3 style="color: #2e6da4;">${otp}</h3>
    <p>This code is valid for 5 minutes.</p>
    <br />
    <p>– Beyond Science Magazine</p>
  </body>
</html>`,
    ".",
    "QUIT",
  ];

  // Send email using SMTP
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

      socket.on("error", (err) => reject(err));
    });
  };

  try {
    await sendSMTP();
    res.send(`OTP sent to ${email}`);
  } catch (err) {
    res.send("Error sending OTP: " + err.message);
  }
};
