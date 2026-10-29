import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_EMAIL_USER = 'rocklandrowanm@gmail.com';
const DEFAULT_EMAIL_PASS = 'vtmfmaxlzluzgzus';

/**
 * Creates and returns a configured Nodemailer transporter for Gmail via direct SSL (port 465)
 */
function getTransporter() {
  const emailUser = process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
  const emailPass = (process.env.EMAIL_PASS || DEFAULT_EMAIL_PASS).replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    throw new Error('Gmail SMTP credentials are not configured (EMAIL_USER / EMAIL_PASS missing)');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Resolves the actual real-world recipient email address for a login event
 */
function resolveRecipientEmail(toEmail) {
  if (!toEmail || typeof toEmail !== 'string') {
    return DEFAULT_EMAIL_USER;
  }
  const clean = toEmail.toLowerCase().trim();

  // If the user logging in is Pushpitha, route to her real personal Gmail
  if (clean.includes('pushpitha')) {
    return 'pushpithamullai@gmail.com';
  }

  // If it's a real email address (e.g. @gmail.com, @yahoo.com, personal domain)
  if (!clean.endsWith('@agriconnect.com') && !clean.endsWith('@agrohub.in') && clean.includes('@') && clean.includes('.')) {
    return clean;
  }

  // Otherwise fallback to project developer/admin
  return process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
}

/**
 * Send password reset email containing the temporary password to the user's Gmail
 */
export async function sendPasswordResetEmail(toEmail, userName, tempPassword) {
  const emailUser = process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
  const transporter = getTransporter();
  const targetRecipient = resolveRecipientEmail(toEmail);

  const mailOptions = {
    from: `"AgriConnect Support" <${emailUser}>`,
    to: targetRecipient,
    subject: `🌾 AgriConnect - Password Reset Details: ${userName || toEmail}`,
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

/**
 * Send security notification email to the respective person's Gmail when a login occurs
 */
export async function sendLoginNotificationEmail(toEmail, userName, role, details = {}) {
  const emailUser = process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
  const transporter = getTransporter();
  const targetRecipient = resolveRecipientEmail(toEmail);

  const formattedTime = details.timestamp || new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const roleLabel =
    role === 'farmer'
      ? 'Farmer / Producer'
      : role === 'buyer'
      ? 'Buyer / Procurement'
      : role === 'admin'
      ? 'Administrator'
      : 'AgriConnect User';

  const device = details.device || 'Desktop / Mobile Web Browser';
  const loginMethod = details.method || 'Password Authentication';
  const ipAddress = details.ip || 'Client Network';

  const mailOptions = {
    from: `"AgriConnect Security" <${emailUser}>`,
    to: targetRecipient,
    subject: `🌾 AgriConnect - Security Alert: New Login (${userName || targetRecipient} - ${roleLabel})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
            .header { background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 32px 24px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #bbf7d0; font-weight: 500; }
            .content { padding: 32px 28px; }
            .alert-badge { display: inline-block; background: #ecfdf5; border: 1px solid #86efac; color: #166534; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; margin-bottom: 16px; }
            .greeting { font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
            .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
            .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { color: #64748b; font-weight: 600; }
            .detail-value { color: #0f172a; font-weight: 700; text-align: right; }
            .action-box { text-align: center; margin-bottom: 24px; }
            .action-btn { display: inline-block; background-color: #166534; color: #ffffff !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 26px; border-radius: 12px; box-shadow: 0 2px 8px rgba(22, 101, 52, 0.25); }
            .security-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 14px 18px; font-size: 12px; line-height: 1.5; color: #92400e; margin-bottom: 20px; }
            .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 AgriConnect</h1>
              <p>Direct Agricultural Digital Marketplace</p>
            </div>
            <div class="content">
              <span class="alert-badge">✓ Security Notification</span>
              <div class="greeting">Hello ${userName || 'Valued User'},</div>
              <div class="message">
                A successful login to your AgriConnect account was just detected. Here are the details of this session:
              </div>
              <div class="details-card">
                <div class="detail-row">
                  <span class="detail-label">Account Name</span>
                  <span class="detail-value">${userName || 'User'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Account Email</span>
                  <span class="detail-value">${toEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Delivered To</span>
                  <span class="detail-value" style="color: #166534;">${targetRecipient}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Account Role</span>
                  <span class="detail-value">${roleLabel}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Login Time</span>
                  <span class="detail-value">${formattedTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Sign-In Method</span>
                  <span class="detail-value">${loginMethod}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Device / Client</span>
                  <span class="detail-value">${device}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Network / IP</span>
                  <span class="detail-value">${ipAddress}</span>
                </div>
              </div>

              <div class="security-card">
                <strong>🔒 Was this you?</strong> If you recently logged into AgriConnect, you can safely disregard this notification. If you did NOT log in or suspect unauthorized activity, please immediately change your password or contact our security team.
              </div>

              <div class="action-box">
                <a href="https://agri-connect-delta-five.vercel.app/login" class="action-btn">Go to AgriConnect</a>
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

  console.log(`📤 Sending login email to respective person: ${targetRecipient} (Account: ${toEmail})`);
  return await transporter.sendMail(mailOptions);
}
