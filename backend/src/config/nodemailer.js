import nodemailer from 'nodemailer';

let transporterInstance = null;

const getTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const isConfigured =
    user &&
    pass &&
    !user.includes('YOUR_GMAIL') &&
    !user.includes('test_smtp_user') &&
    !user.includes('your_smtp_user');

  if (!isConfigured) return null;

  if (!transporterInstance) {
    const isSSL = port === 465;

    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure: isSSL, // true for port 465 SSL, false for 587 STARTTLS
      auth: { user, pass },
      pool: true, // Reuse persistent SMTP TCP connections for 10x faster delivery
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 5000, // 5 second connection timeout
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log(`⚡ SMTP Connection Pool initialized (${host}:${port}, user: ${user})`);
  }

  return transporterInstance;
};

export const sendOTPEmail = async (toEmail, otp) => {
  const user = process.env.EMAIL_USER;
  const fromAddress = process.env.EMAIL_FROM || user || 'noreply@schoolmgmt.com';
  const transporter = getTransporter();

  if (transporter) {
    try {
      const mailOptions = {
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
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Real OTP email delivered to ${toEmail} (id: ${info.messageId})`);
      return true;
    } catch (error) {
      console.error(`\n❌ ====== SMTP EMAIL FAILURE ======`);
      console.error(`   To       : ${toEmail}`);
      console.error(`   Reason   : ${error.message}`);
      console.error(`   Code     : ${error.code || 'N/A'}`);
      console.error(`=================================\n`);
    }
  } else {
    console.warn(`⚠️ SMTP not configured or disabled in environment.`);
  }

  // Always log OTP to server console as instant backup display
  console.log('\n========================================');
  console.log(`📧 [OTP BACKUP DISPLAY] To   : ${toEmail}`);
  console.log(`🔑 [OTP BACKUP DISPLAY] Code : ${otp}`);
  console.log('========================================\n');
  return true;
};
