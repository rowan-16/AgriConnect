import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Creates and returns a configured Nodemailer transporter for Gmail
 */
function getTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!emailUser || !emailPass) {
    throw new Error('Gmail SMTP credentials are not configured in .env (EMAIL_USER / EMAIL_PASS missing)');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Send password reset email containing the temporary password to the user's Gmail
 */
export async function sendPasswordResetEmail(toEmail, userName, tempPassword) {
  const emailUser = process.env.EMAIL_USER;
  const transporter = getTransporter();

  const mailOptions = {
    from: `"AgriConnect Support" <${emailUser}>`,
    to: toEmail,
    subject: '🌾 AgriConnect - Your Password Reset Details',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #bbf7d0; font-weight: 500; }
            .content { padding: 32px 28px; }
            .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
            .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
            .password-card { background: #f0fdf4; border: 1.5px dashed #22c55e; border-radius: 14px; padding: 18px 24px; text-align: center; margin-bottom: 24px; }
            .password-label { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #166534; letter-spacing: 1px; margin-bottom: 6px; }
            .password-val { font-size: 26px; font-weight: 800; color: #15803d; letter-spacing: 2px; font-family: monospace; }
            .action-box { text-align: center; margin-bottom: 28px; }
            .action-btn { display: inline-block; background-color: #166534; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 2px 8px rgba(22, 101, 52, 0.25); }
            .security-note { font-size: 12px; line-height: 1.5; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 AgriConnect</h1>
              <p>Next-Gen Digital Agricultural Marketplace</p>
            </div>
            <div class="content">
              <div class="greeting">Hello ${userName || 'Farmer / Buyer'},</div>
              <div class="message">
                We received a request to recover the password for your AgriConnect account associated with <strong>${toEmail}</strong>.
              </div>
              <div class="password-card">
                <div class="password-label">Your New Temporary Password</div>
                <div class="password-val">${tempPassword}</div>
              </div>
              <div class="action-box">
                <a href="https://agri-connect-delta-five.vercel.app/login" class="action-btn">Log In to AgriConnect</a>
              </div>
              <div class="security-note">
                <strong>Security Tip:</strong> Use this password to log in, and remember to update your password in your Account Settings right away. If you did not request this, please disregard this email.
              </div>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} AgriConnect Digital Agriculture Platform. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
