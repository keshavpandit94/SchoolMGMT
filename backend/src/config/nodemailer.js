import nodemailer from 'nodemailer';

let transporterInstance = null;

/**
 * Get or initialize the Nodemailer transporter instance configured for Gmail or custom SMTP.
 */
export const getTransporter = () => {
  if (transporterInstance) return transporterInstance;

  const user = (
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    ''
  ).trim();

  const rawPass = (
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASS ||
    process.env.SMTP_PASS ||
    ''
  ).trim();

  // Google App Passwords are 16 characters often copied with spaces (e.g. "abcd efgh ijkl mnop")
  const pass = rawPass.replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  const host = (process.env.SMTP_HOST || '').trim().toLowerCase();
  const isCustomSmtp = host && host !== 'smtp.gmail.com';

  if (isCustomSmtp) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: { user, pass },
    });
  } else {
    // Standard Gmail Service Transporter
    transporterInstance = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return transporterInstance;
};

/**
 * Verify transporter connection with the mail server
 */
export const verifyTransporter = async () => {
  const transporter = getTransporter();
  if (!transporter) {
    return { verified: false, message: 'No email credentials configured in environment variables' };
  }
  try {
    await transporter.verify();
    console.log('✅ [Nodemailer] SMTP / Gmail Transporter verified successfully');
    return { verified: true };
  } catch (err) {
    console.error('❌ [Nodemailer] Transporter verification failed:', err.message);
    return { verified: false, error: err.message };
  }
};

/**
 * Dispatch OTP verification email using Nodemailer
 * @param {string} toEmail Recipient email address
 * @param {string} otp 6-digit one-time passcode
 */
export const sendOTPEmail = async (toEmail, otp) => {
  const transporter = getTransporter();

  const user = (
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    ''
  ).trim();

  const rawFrom =
    process.env.EMAIL_FROM ||
    (user ? `EduManage System <${user}>` : 'EduManage System <no-reply@edumanage.com>');
  const from = rawFrom.trim();

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">EduManage</h1>
        <p style="color: #c7d2fe; margin: 6px 0 0; font-size: 14px;">School Management System</p>
      </div>
      <div style="padding: 36px 32px;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hello,</p>
        <p style="color: #6B7280; font-size: 15px; margin-top: 0; line-height: 1.5;">A one-time verification passcode (OTP) was requested for your account: <strong style="color: #111827;">${toEmail}</strong></p>
        <div style="background: #F3F4F6; border-radius: 12px; text-align: center; padding: 28px; margin: 28px 0; border: 1px dashed #D1D5DB;">
          <span style="font-size: 44px; font-weight: 800; letter-spacing: 12px; color: #4F46E5; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 12px;">${otp}</span>
        </div>
        <p style="color: #4B5563; font-size: 14px; margin-bottom: 8px;">⏱ Valid for <strong>5 minutes</strong>. Do not share this passcode with anyone.</p>
        <p style="color: #9CA3AF; font-size: 13px; margin: 0;">If you did not request this login passcode, you can safely ignore this email.</p>
      </div>
      <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">EduManage School Management System • Secure Transactional Authentication</p>
      </div>
    </div>
  `;

  const text = `EduManage School Management System\n\nYour one-time login passcode (OTP) is: ${otp}\n\nValid for 5 minutes. Do not share this passcode with anyone.\nIf you did not request this login passcode, please ignore this email.`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: `🔐 EduManage - Your Verification Passcode: ${otp}`,
        text,
        html,
      });

      console.log(`✅ [Nodemailer] Real OTP email delivered to ${toEmail} (messageId: ${info.messageId})`);
      return true;
    } catch (err) {
      console.error(`❌ [Nodemailer Delivery Error] Failed to send email to ${toEmail}:`, err.message);

      if (err.message && (err.message.includes('Invalid login') || err.message.includes('535-5.7.8') || err.message.includes('Username and Password not accepted'))) {
        console.error(
          `💡 [Gmail App Password Required]: Gmail requires a 16-character App Password when 2-Step Verification is enabled.\n` +
          `👉 Generate one at: https://myaccount.google.com/apppasswords and set it in EMAIL_PASS in your .env file.`
        );
      }
    }
  } else {
    console.warn(`ℹ️ [Nodemailer] No email credentials (EMAIL_USER & EMAIL_PASS) configured in .env. Using server console display.`);
  }

  // Fallback: Always display OTP in console so login flow never breaks during dev or offline use
  console.log('\n========================================');
  console.log(`📧 [CONSOLE OTP DISPLAY] To   : ${toEmail}`);
  console.log(`🔑 [CONSOLE OTP DISPLAY] Code : ${otp}`);
  console.log('========================================\n');
  return true;
};

export default {
  getTransporter,
  verifyTransporter,
  sendOTPEmail,
};
