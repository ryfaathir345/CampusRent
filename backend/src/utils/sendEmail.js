const nodemailer = require('nodemailer');

/**
 * Utility untuk mengirim email
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async (options) => {
  // Buat transporter menggunakan SMTP (disarankan Gmail untuk testing)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true untuk 465, false untuk port lain
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Konfigurasi email
  const mailOptions = {
    from: `"CampusRent Support" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // Kirim email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
