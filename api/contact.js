const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message, consent } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  if (!consent || consent !== 'true') {
    return res.status(400).json({ error: 'Consent is required.' });
  }

  // Configure Gmail SMTP transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: process.env.GMAIL_USER,       // your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not your login password)
    }
  });

  const mailOptions = {
    from: `"Codalithic Website" <${process.env.GMAIL_USER}>`,
    to: 'codalithic@gmail.com',
    replyTo: email,
    subject: `New Lead: ${service || 'General Inquiry'} — from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px;">
        <div style="background:linear-gradient(135deg,#C026D3,#7C3AED);padding:20px 24px;border-radius:8px;margin-bottom:24px;">
          <h2 style="color:#fff;margin:0;font-size:1.3rem;">New Lead from Codalithic Website</h2>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:.85rem;width:140px;">Full Name</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:.85rem;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;"><a href="mailto:${email}" style="color:#7C3AED;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:.85rem;">Phone</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;">${phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:.85rem;">Service</td>
            <td style="padding:10px 0;border-bottom:1px solid #eee;">
              <span style="background:#7C3AED;color:#fff;padding:3px 10px;border-radius:20px;font-size:.82rem;">${service || 'Not specified'}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#888;font-size:.85rem;vertical-align:top;padding-top:16px;">Message</td>
            <td style="padding:10px 0;padding-top:16px;line-height:1.6;">${message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>

        <div style="margin-top:24px;padding:14px;background:#fff3cd;border-radius:8px;font-size:.82rem;color:#856404;">
          ✓ User gave consent for contact and Dialpad verification
        </div>

        <p style="margin-top:20px;font-size:.78rem;color:#aaa;text-align:center;">
          Sent from codalithic.com contact form · ${new Date().toLocaleString('en-GB', {timeZone:'Europe/London'})}
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again or contact us directly.' });
  }
}
