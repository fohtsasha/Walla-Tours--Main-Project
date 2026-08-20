const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

/**
 * Send an email with log file.
 * @param {string} logFilePath - Path to the log file
 * @param {string} subject - Email subject
 * @param {string} to - Recipient(s)
 */
async function sendEmailWithLogs(logFilePath, subject = '📊 Walla Tours Test Results', to = 'alexandrafo@wallatours.co.il') {
  if (!fs.existsSync(logFilePath)) {
    console.error(`❌ Log file not found: ${logFilePath}`);
    return;
  }

  // Parse log for screenshot paths
  const logContent = fs.readFileSync(logFilePath, 'utf8');
  const screenshotPaths = [];
  const regex = /\[Screenshot\].*?: (.+\.png)/g;
  let match;
  while ((match = regex.exec(logContent)) !== null) {
    if (fs.existsSync(match[1])) screenshotPaths.push(match[1]);
  }

  const transporter = nodemailer.createTransport({
    host: 'send.smtp.com',
    port: 25,
    secure: false,
    tls: { rejectUnauthorized: false },
    socketTimeout: 10000,
    connectionTimeout: 10000
  });

  const attachments = [
    {
      filename: path.basename(logFilePath),
      path: logFilePath
    },
    // Add screenshots as attachments
    ...screenshotPaths.map(filePath => ({
      filename: path.basename(filePath),
      path: filePath
    }))
  ];

  const mailOptions = {
    from: 'alexandrafo@wallatours.co.il',
    to,
    subject,
    text: `Hi,

🧪 The automated test logs are attached.

– Alexandra`,
    attachments
  };

  try {
    console.log('📨 About to send email');
    console.log('   To:', mailOptions.to);
    console.log('   Attachments:', attachments.map(a => a.filename));

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
  }
}

module.exports = sendEmailWithLogs;