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
 * Sends email using a high-speed, multi-tier SMTP transport strategy:
 * Tier 1: Direct SSL Port 465 to smtp.gmail.com (Fastest: ~1-2 seconds)
 * Tier 2: Official service: 'gmail' transporter (~1-2 seconds)
 * Tier 3: STARTTLS Port 587 to smtp.gmail.com
 * Tier 4: Direct IPv4 fallbacks if DNS fails completely
 */
async function sendMailWithFallback(mailOptions) {
  const emailUser = process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
  const emailPass = (process.env.EMAIL_PASS || DEFAULT_EMAIL_PASS).replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    throw new Error('Gmail SMTP credentials are not configured (EMAIL_USER / EMAIL_PASS missing)');
  }

  let lastErr = null;

  // Tier 1: Direct SSL Port 465 to smtp.gmail.com (Fastest: ~1-2 seconds)
  try {
    const transporter465 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    });
    const info = await transporter465.sendMail(mailOptions);
    console.log(`✅ Mail dispatched via smtp.gmail.com:465 (ID: ${info.messageId})`);
    return info;
  } catch (err1) {
    lastErr = err1;
    console.warn('⚠️ Tier 1 (smtp.gmail.com:465) notice:', err1.message);
  }

  // Tier 2: Official service: 'gmail' transporter (~1-2 seconds)
  try {
    const transporterGmail = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    });
    const info = await transporterGmail.sendMail(mailOptions);
    console.log(`✅ Mail dispatched via service:gmail (ID: ${info.messageId})`);
    return info;
  } catch (err2) {
    lastErr = err2;
    console.warn('⚠️ Tier 2 (service:gmail) notice:', err2.message);
  }

  // Tier 3: STARTTLS Port 587 to smtp.gmail.com
  try {
    const transporter587 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
      tls: {
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    });
    const info = await transporter587.sendMail(mailOptions);
    console.log(`✅ Mail dispatched via smtp.gmail.com:587 (ID: ${info.messageId})`);
    return info;
  } catch (err3) {
    lastErr = err3;
    console.warn('⚠️ Tier 3 (smtp.gmail.com:587) notice:', err3.message);
  }

  // Tier 4: Direct IPv4 fallbacks if DNS fails completely
  const ipv4List = await getGmailSmtpIpv4Addresses();
  for (const ip of ipv4List.slice(0, 2)) {
    try {
      const transporterIp = nodemailer.createTransport({
        host: ip,
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPass },
        tls: {
          servername: 'smtp.gmail.com',
          rejectUnauthorized: false,
        },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 6000,
      });
      const info = await transporterIp.sendMail(mailOptions);
      console.log(`✅ Mail dispatched via IPv4 ${ip}:465 (ID: ${info.messageId})`);
      return info;
    } catch (errIp) {
      lastErr = errIp;
      console.warn(`⚠️ Tier 4 IPv4 (${ip}) notice:`, errIp.message);
    }
  }

  throw lastErr || new Error('All SMTP email delivery tiers failed.');
}

/**
 * Resolves the actual real-world recipient email address for a login event:
 * - Jowan logins -> jowanm1234@gmail.com
 * - Pushpitha / Buyer logins -> pushpithamullai@gmail.com
 * - Rowan logins -> rocklandrowanm@gmail.com
 * - Any valid personal email (e.g. user@gmail.com) -> that exact email
 * - Demo presets -> delivered to real evaluator inboxes
 */
export function resolveRecipientEmail(toEmail, role = '') {
  const adminEmail = (process.env.EMAIL_USER || DEFAULT_EMAIL_USER).trim();
  if (!toEmail || typeof toEmail !== 'string') {
    return adminEmail;
  }
  const clean = toEmail.toLowerCase().trim();

  // 1. Direct personal email addresses
  if (clean === 'jowanm1234@gmail.com') return 'jowanm1234@gmail.com';
  if (clean === 'rocklandrowanm@gmail.com') return 'rocklandrowanm@gmail.com';
  if (clean === 'pushpithamullai@gmail.com') return 'pushpithamullai@gmail.com';

  // 2. If it's a real personal email (like personal @gmail.com, @yahoo.com, etc.), deliver directly to that address!
  const isDemoDomain =
    clean.endsWith('@agriconnect.com') ||
    clean.endsWith('@agriconnect.test') ||
    clean.endsWith('@agrohub.in') ||
    clean.endsWith('@agri.com') ||
    clean === 'farmer@agri.com' ||
    clean === 'buyer@agri.com' ||
    clean === 'admin@agri.com';

  if (!isDemoDomain && clean.includes('@') && clean.includes('.')) {
    return clean;
  }

  // 3. For evaluator demo preset logins (ramesh.farmer@agriconnect.com, priya.buyer@agriconnect.com, etc.)
  // Deliver directly to the active project testers in real-time!
  if (clean.includes('ramesh') || clean.includes('farmer') || role === 'farmer') {
    return ['jowanm1234@gmail.com', 'rocklandrowanm@gmail.com'];
  }

  if (clean.includes('priya') || clean.includes('buyer') || role === 'buyer') {
    return ['jowanm1234@gmail.com', 'pushpithamullai@gmail.com', 'rocklandrowanm@gmail.com'];
  }

  return ['rocklandrowanm@gmail.com', 'jowanm1234@gmail.com'];
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
 * Send confirmation email to the respective person's Gmail when a login occurs
 */
export async function sendLoginNotificationEmail(toEmail, userName, role, details = {}) {
  const emailUser = process.env.EMAIL_USER || DEFAULT_EMAIL_USER;
  const targetRecipient = resolveRecipientEmail(toEmail, role);
  const recipientDisplay = Array.isArray(targetRecipient) ? targetRecipient.join(', ') : targetRecipient;

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

  const plainText = `AgriConnect: Login Confirmation

Hello ${userName || 'User'},

A login to your AgriConnect account was confirmed:
- Account: ${toEmail}
- Target Recipient: ${recipientDisplay}
- Role: ${roleLabel}
- Time: ${formattedTime}
- Sign-In Method: ${loginMethod}
- Device: ${device}

If this was you, you are all set. If you did not log in, please reset your password.
AgriConnect Platform: https://agri-connect-delta-five.vercel.app`;

    const timeShort = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const mailOptions = {
    from: `"Rockland Rowan (AgriConnect)" <${emailUser}>`,
    replyTo: emailUser,
    to: targetRecipient,
    subject: `[AgriConnect Security] Successful Login: ${userName || toEmail} (${roleLabel}) at ${timeShort}`,
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
                  <span class="detail-value" style="color: #166534;">${recipientDisplay}</span>
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
                  <span class="detail-label">Device</span>
                  <span class="detail-value">${device}</span>
                </div>
              </div>

              <div class="action-box">
                <a href="https://agri-connect-delta-five.vercel.app" class="action-btn">Open AgriConnect</a>
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

  console.log(`📤 Sending login email to respective person: ${recipientDisplay} (Account: ${toEmail})`);
  return await sendMailWithFallback(mailOptions);
}
