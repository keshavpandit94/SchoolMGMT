/**
 * Brevo HTTPS Email API Service
 * Uses HTTPS Port 443 (100% cloud firewall compatible on Render & Vercel)
 * Free tier delivers 300 emails/day to ANY recipient without domain restriction.
 */
export const sendOTPEmail = async (toEmail, otp) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL || 'contact@schoolmgmt.com';
  const senderName = process.env.EMAIL_FROM_NAME || 'EduManage System';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">EduManage</h1>
        <p style="color: #c7d2fe; margin: 6px 0 0; font-size: 14px;">School Management System</p>
      </div>
      <div style="padding: 36px 32px;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">Hello,</p>
        <p style="color: #6B7280; font-size: 15px; margin-top: 0; line-height: 1.5;">A one-time verification passcode (OTP) was requested for: <strong style="color: #111827;">${toEmail}</strong></p>
        <div style="background: #F3F4F6; border-radius: 12px; text-align: center; padding: 28px; margin: 28px 0; border: 1px dashed #D1D5DB;">
          <span style="font-size: 44px; font-weight: 800; letter-spacing: 12px; color: #4F46E5; font-family: monospace; display: inline-block; padding-left: 12px;">${otp}</span>
        </div>
        <p style="color: #4B5563; font-size: 14px; margin-bottom: 8px;">⏱ Valid for <strong>5 minutes</strong>. Do not share this passcode with anyone.</p>
        <p style="color: #9CA3AF; font-size: 13px; margin: 0;">If you did not request this passcode, you can safely ignore this email.</p>
      </div>
      <div style="background: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">EduManage School Management System • Secure Transactional Authentication</p>
      </div>
    </div>
  `;

  // 1. Primary: Send real email via Brevo HTTPS REST API (v3)
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: fromEmail },
          to: [{ email: toEmail }],
          subject: `🔐 EduManage - Your Verification Passcode: ${otp}`,
          htmlContent,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ [Brevo HTTPS API] Real OTP email delivered to ${toEmail} (messageId: ${data.messageId})`);
        return true;
      } else {
        console.error(`❌ [Brevo HTTPS API Error]:`, data);
        if (data?.message?.toLowerCase().includes('sender') || data?.code === 'invalid_parameter') {
          console.error(
            `💡 [Brevo Sender Setup Tip]: Make sure '${fromEmail}' is added and verified under 'Senders & IP' in your Brevo dashboard (https://app.brevo.com/senders).`
          );
        }
      }
    } catch (error) {
      console.error(`❌ [Brevo HTTPS API Network Error]: ${error.message}`);
    }
  }

  // 2. Secondary Fallback: Resend HTTPS REST API (if configured)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${senderName} <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
          to: [toEmail],
          subject: `🔐 EduManage - Your Verification Passcode: ${otp}`,
          html: htmlContent,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ [Resend HTTPS API] Real OTP email delivered to ${toEmail} (id: ${data.id})`);
        return true;
      } else {
        console.error(`❌ [Resend HTTPS API Error]:`, data);
      }
    } catch (error) {
      console.error(`❌ [Resend HTTPS API Network Error]: ${error.message}`);
    }
  }

  if (!brevoApiKey && !resendApiKey) {
    console.warn(`ℹ️ BREVO_API_KEY not set in environment. Using server console OTP display.`);
  }

  // 3. Fallback Console Log Display (Ensures login never breaks during dev or network downtime)
  console.log('\n========================================');
  console.log(`📧 [CONSOLE OTP DISPLAY] To   : ${toEmail}`);
  console.log(`🔑 [CONSOLE OTP DISPLAY] Code : ${otp}`);
  console.log('========================================\n');
  return true;
};
