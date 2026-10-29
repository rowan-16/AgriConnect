import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Configure Node DNS to prefer IPv4 results to prevent IPv6 socket blackholing in cloud environments
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {}

const DEFAULT_EMAIL_USER = 'rocklandrowanm@gmail.com';
const DEFAULT_EMAIL_PASS = 'vtmfmaxlzluzgzus';

// Standard Google SMTP IPv4 fallback addresses
const GOOGLE_SMTP_IPV4_FALLBACKS = [
  '142.250.152.108',
  '172.253.115.108',
  '173.194.202.108',
  '192.179.20.108',
];

/**
 * Resolves active IPv4 addresses for smtp.gmail.com to avoid IPv6 timeouts on Vercel/serverless
 */
async function getGmailSmtpIpv4Addresses() {
  try {
    const addresses = await dns.promises.resolve4('smtp.gmail.com');
    if (Array.isArray(addresses) && addresses.length > 0) {
      return addresses;
    }
  } catch (err) {
    console.warn('⚠️ dns.resolve4 notice:', err.message);
  }
  return GOOGLE_SMTP_IPV4_FALLBACKS;
}

/**
 * Sends email using a resilient IPv4 transport strategy:
 * 1. Direct SSL Port 465 to resolved IPv4 addresses with SNI
 * 2. STARTTLS Port 587 to resolved IPv4 addresses with SNI
 * 3. service: 'gmail' (standard Nodemailer fallback)
 */
async function sendMailWithFallback(mailOptions) {
  const emailUser = process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
  const emailPass = (process.env.EMAIL_PASS || DEFAULT_EMAIL_PASS).replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    throw new Error('Gmail SMTP credentials are not configured (EMAIL_USER / EMAIL_PASS missing)');
  }

  const ipv4List = await getGmailSmtpIpv4Addresses();
  let lastErr = null;

  // Tier 1: Direct SSL Port 465 to IPv4 endpoints (bypasses IPv6 timeouts completely)
  for (const ip of ipv4List.slice(0, 2)) {
    try {
      const transporter = nodemailer.createTransport({
        host: ip,
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPass },
        tls: {
          servername: 'smtp.gmail.com',
          rejectUnauthorized: false,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Mail dispatched via IPv4 ${ip}:465 (ID: ${info.messageId})`);
      return info;
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ Port 465 (${ip}) delivery notice:`, err.message);
    }
  }

  // Tier 2: STARTTLS Port 587 to IPv4 endpoints
  for (const ip of ipv4List.slice(0, 2)) {
    try {
      const transporter = nodemailer.createTransport({
        host: ip,
        port: 587,
        secure: false,
        auth: { user: emailUser, pass: emailPass },
        tls: {
          servername: 'smtp.gmail.com',
          rejectUnauthorized: false,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Mail dispatched via IPv4 ${ip}:587 (ID: ${info.messageId})`);
      return info;
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ Port 587 (${ip}) delivery notice:`, err.message);
    }
  }

  // Tier 3: service: 'gmail'
  try {
    const transporterGmail = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
    const info = await transporterGmail.sendMail(mailOptions);
    console.log(`✅ Mail dispatched via service:gmail (ID: ${info.messageId})`);
    return info;
  } catch (err3) {
    lastErr = err3;
    console.warn('⚠️ Tier 3 (service: gmail) notice:', err3.message);
  }

  throw lastErr || new Error('All SMTP email delivery tiers failed.');
}

/**
 * Resolves the actual real-world recipient email address for a login event
 */
export function resolveRecipientEmail(toEmail) {
  if (!toEmail || typeof toEmail !== 'string') {
    return DEFAULT_EMAIL_USER;
  }
  const clean = toEmail.toLowerCase().trim();

  // If the user logging in is Pushpitha, route to her real personal Gmail
  if (clean.includes('pushpitha') || clean.includes('mullai')) {
    return 'pushpithamullai@gmail.com';
  }

  // If the user logging in is Rowan, route to his real personal Gmail
  if (clean.includes('rowan') || clean.includes('rockland')) {
    return 'rocklandrowanm@gmail.com';
  }

  // If the user logging in is Jowan, route to his real personal Gmail
  if (clean.includes('jowan')) {
    return 'jowanm1234@gmail.com';
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
  const targetRecipient = resolveRecipientEmail(toEmail);

  const plainText = `AgriConnect Password Recovery

Hello ${userName || 'Farmer / Buyer'},

We received a request to recover the password for your AgriConnect account (${toEmail}).

Your Temporary Password: ${tempPassword}

Log in at: https://agri-connect-delta-five.vercel.app/login
Please update your password in Account Settings once logged in.

- AgriConnect Team`;

  const mailOptions = {
    from: `"Rockland Rowan (AgriConnect)" <${emailUser}>`,
    replyTo: emailUser,
    to: targetRecipient,
    subject: `AgriConnect Password Reset: ${userName || toEmail}`,
    text: plainText,
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
              <p>Direct Agricultural Digital Marketplace</p>
            </div>
            <div class="content">
              <div class="greeting">Hello ${userName || 'Farmer / Buyer'},</div>
              <div class="message">
                We received a request to recover the password for your AgriConnect account associated with <strong>${toEmail}</strong>.
              </div>
              <div class="password-card">
                <div class="password-label">Your Temporary Password</div>
                <div class="password-val">${tempPassword}</div>
              </div>
              <div class="action-box">
                <a href="https://agri-connect-delta-five.vercel.app/login" class="action-btn">Log In to AgriConnect</a>
              </div>
              <div class="security-note">
                Use this password to sign in, then update your password in Account Settings. If you did not request this, please disregard this email.
              </div>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} AgriConnect Platform. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  console.log(`📤 Sending password reset email to: ${targetRecipient} (Account: ${toEmail})`);
  return await sendMailWithFallback(mailOptions);
}

/**
 * Send security notification email to the respective person's Gmail when a login occurs
 */
export async function sendLoginNotificationEmail(toEmail, userName, role, details = {}) {
  const emailUser = process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
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

  const plainText = `AgriConnect Login Confirmation

Hello ${userName || 'User'},

A login to your AgriConnect account was just confirmed.
- Account: ${toEmail}
- Delivered to: ${targetRecipient}
- Role: ${roleLabel}
- Time: ${formattedTime}
- Sign-In Method: ${loginMethod}
- Device: ${device}

If this was you, you are all set. If you did not log in, please reset your password.
AgriConnect Platform: https://agri-connect-delta-five.vercel.app`;

  const mailOptions = {
    from: `"Rockland Rowan (AgriConnect)" <${emailUser}>`,
    replyTo: emailUser,
    to: targetRecipient,
    subject: `AgriConnect Login Confirmation: ${userName || targetRecipient}`,
    text: plainText,
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
              <span class="alert-badge">✓ Login Confirmation</span>
              <div class="greeting">Hello ${userName || 'Valued User'},</div>
              <div class="message">
                A successful login to your AgriConnect account was confirmed:
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
                  <span class="detail-label">Recipient Gmail</span>
                  <span class="detail-value" style="color: #166534;">${targetRecipient}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Role</span>
                  <span class="detail-value">${roleLabel}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Login Time</span>
                  <span class="detail-value">${formattedTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Method</span>
                  <span class="detail-value">${loginMethod}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Client Device</span>
                  <span class="detail-value">${device}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Network IP</span>
                  <span class="detail-value">${ipAddress}</span>
                </div>
              </div>

              <div class="action-box">
                <a href="https://agri-connect-delta-five.vercel.app/login" class="action-btn">Open AgriConnect</a>
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
  return await sendMailWithFallback(mailOptions);
}
