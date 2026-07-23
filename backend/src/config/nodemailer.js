import nodemailer from 'nodemailer';

export const sendOTPEmail = async (toEmail, otp) => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  // EMAIL_FROM MUST match EMAIL_USER on Gmail — any mismatch causes rejection
  const fromAddress = process.env.EMAIL_FROM || user;

  const isConfigured =
    host &&
    user &&
    pass &&
    !user.includes('YOUR_GMAIL') &&
    !user.includes('test_smtp_user') &&
    !user.includes('your_smtp_user');

  if (isConfigured) {
    try {
      const transportConfig = {
        host,
        port,
        // port 465 = implicit SSL, port 587 = STARTTLS (secure: false + tls upgrade)
        secure: port === 465,
        auth: { user, pass },
        // Required for Gmail port 587 STARTTLS negotiation
        tls: {
          rejectUnauthorized: true,
        },
      };

      // Gmail shortcut: use service key for better reliability
      const isGmail = host === 'smtp.gmail.com';
      const transporter = isGmail
        ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
        : nodemailer.createTransport(transportConfig);

      // Verify SMTP connection before attempting to send
      await transporter.verify();

      const info = await transporter.sendMail({
        from: `"EduManage School System" <${fromAddress}>`,
        to: toEmail,
        subject: '🔐 EduManage - Your Login OTP Code',
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">EduManage</h1>
              <p style="color: #c7d2fe; margin: 6px 0 0; font-size: 14px;">School Management System</p>
            </div>
            <div style="padding: 40px 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 10px;">Hello,</p>
              <p style="color: #6B7280; font-size: 15px;">Your one-time login passcode (OTP) is ready:</p>
              <div style="background: #F3F4F6; border-radius: 12px; text-align: center; padding: 28px; margin: 28px 0;">
                <span style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #1F2937; font-family: monospace;">${otp}</span>
              </div>
              <p style="color: #6B7280; font-size: 14px;">⏱ Valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
              <p style="color: #9CA3AF; font-size: 13px;">If you did not request this code, you can safely ignore this email.</p>
            </div>
            <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9CA3AF; font-size: 12px; margin: 0;">EduManage School Management System</p>
            </div>
          </div>
        `,
      });

      console.log(`✅ OTP email delivered to ${toEmail} (id: ${info.messageId})`);
      return true;
    } catch (error) {
      // Print the exact SMTP error so it is easy to diagnose
      console.error(`\n❌ ====== SMTP EMAIL FAILURE ======`);
      console.error(`   Host     : ${host}:${port}`);
      console.error(`   User     : ${user}`);
      console.error(`   Reason   : ${error.message}`);
      console.error(`   Code     : ${error.code || 'N/A'}`);
      console.error(`=================================\n`);
    }
  } else {
    console.warn(`\n⚠️  Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env`);
  }

  // Console fallback so login still works even without email
  console.log('\n========================================');
  console.log(`📧 [OTP CONSOLE LOG] To    : ${toEmail}`);
  console.log(`🔑 [OTP CONSOLE LOG] Code  : ${otp}`);
  console.log('========================================\n');
  return true;
};
