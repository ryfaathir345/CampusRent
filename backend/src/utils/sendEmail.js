const nodemailer = require('nodemailer');

/**
 * Utility untuk mengirim email
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async (options) => {
  // Jika menggunakan Brevo API (via HTTP untuk bypass blokir SMTP Railway)
  if (process.env.BREVO_API_KEY) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'CampusRent Support',
          email: process.env.SMTP_USER // pastikan email ini diverifikasi di Brevo
        },
        to: [
          { email: options.to }
        ],
        subject: options.subject,
        htmlContent: options.html
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Brevo API Error:', errorData);
      throw new Error('Gagal mengirim email via Brevo');
    }
    
    return;
  }

  // Fallback: Gunakan Nodemailer (SMTP) jika tidak ada BREVO_API_KEY (biasanya untuk testing lokal)
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"CampusRent Support" <${process.env.SMTP_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
