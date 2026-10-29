import dotenv from 'dotenv';
import { sendLoginNotificationEmail } from '../server/services/emailService.js';

dotenv.config();

async function runTest() {
  console.log('====================================================');
  console.log('🌾 AgriConnect - Login Notification Email Tester');
  console.log('====================================================\n');

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS is not configured in your .env file.\n');
    console.log('📋 Follow these steps to configure Gmail sending:');
    console.log('1. Go to your Google Account (https://myaccount.google.com/security)');
    console.log('2. Ensure "2-Step Verification" is ON.');
    console.log('3. Scroll to "App passwords" (or search "App passwords").');
    console.log('4. Create an App password (app name: "AgriConnect").');
    console.log('5. Copy the generated 16-letter password (e.g. abcd efgh ijkl mnop).');
    console.log('6. Open your .env file in the project and set:');
    console.log('   EMAIL_USER=your_email@gmail.com');
    console.log('   EMAIL_PASS=your16charpassword\n');
    console.log('Then run this test script again: node scripts/test_login_email.js [your_target_email@gmail.com]\n');
    return;
  }

  const targetEmail = process.argv[2] || emailUser;
  const targetName = process.argv[3] || 'Ramesh Patel (Farmer)';

  console.log(`📡 Sending test login notification email...`);
  console.log(`• Sender (EMAIL_USER): ${emailUser}`);
  console.log(`• Recipient:            ${targetEmail}`);
  console.log(`• User Name:            ${targetName}`);
  console.log(`• Account Role:         Farmer / Producer\n`);

  try {
    const info = await sendLoginNotificationEmail(targetEmail, targetName, 'farmer', {
      timestamp: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
      device: 'Windows PC (Desktop Chrome)',
      method: 'Password Authentication',
      ip: '127.0.0.1 (Local Test Session)',
    });

    console.log('✅ Email sent successfully!');
    console.log(`• Message ID: ${info.messageId}`);
    console.log(`• Accepted:   ${info.accepted.join(', ')}`);
    console.log(`\n🎉 Please open ${targetEmail} in Gmail to view the security notification email.`);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    if (err.message.includes('Invalid login') || err.message.includes('Username and Password not accepted')) {
      console.log('\n💡 Hint: For Gmail, you MUST use a 16-character Google "App Password", not your normal login password.');
    }
  }
}

runTest();
