/**
 * Resend HTTPS Email API Service
 * Uses HTTPS Port 443 (100% cloud firewall compatible on Render & Vercel)
 */
export const sendOTPEmail = async (toEmail, otp) => {
  const apiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  // 1. Primary: Send real email via Resend HTTPS REST API if API Key is configured
  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: `EduManage System <${fromEmail}>`,
          to: [toEmail],
          subject: `🔐 EduManage - Your Verification Passcode: ${otp}`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">EduManage</h1>
                <p style="color: #c7d2fe; margin: 6px 0 0; font-size: 14px;">School Management System</p>
              </div>
              <div style="padding: 40px 32px;">
                <p style="color: #374151; font-size: 16px; margin: 0 0 5px;">Hello,</p>
                <p style="color: #6B7280; font-size: 15px; margin-top: 0;">One-time login passcode (OTP) requested for: <strong>${toEmail}</strong></p>
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
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ [Resend HTTPS API] Real OTP email delivered to ${toEmail} (id: ${data.id})`);
        return true;
      } else {
        console.error(`❌ [Resend HTTPS API Error]:`, data);
        if (data?.message?.includes('testing emails to your own email address')) {
          console.error(
            `💡 [Resend Sandbox Restriction]: With '${fromEmail}', Resend free tier only allows delivery to the account owner email.\n` +
            `👉 To deliver to any user email (${toEmail}), verify your custom domain at https://resend.com/domains and set EMAIL_FROM to an address on that domain (e.g. EMAIL_FROM="EduManage <notifications@yourdomain.com>").`
          );
        }
      }
    } catch (error) {
      console.error(`❌ [Resend HTTPS API Network Error]: ${error.message}`);
    }
  }

  // 2. Secondary: Brevo HTTPS REST API (Free 300 emails/day to ANY email without domain verification)
  if (brevoApiKey) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: { name: 'EduManage System', email: process.env.EMAIL_FROM || 'contact@schoolmgmt.com' },
          to: [{ email: toEmail }],
          subject: `🔐 EduManage - Your Verification Passcode: ${otp}`,
          htmlContent: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px;">
              <h2>EduManage School Management System</h2>
              <p>One-time login passcode (OTP) for: <strong>${toEmail}</strong></p>
              <h1 style="letter-spacing: 8px; font-size: 40px; color: #4F46E5;">${otp}</h1>
              <p>Valid for 5 minutes.</p>
            </div>
          `,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ [Brevo HTTPS API] Real OTP email delivered to ${toEmail} (messageId: ${data.messageId})`);
        return true;
      } else {
        console.error(`❌ [Brevo HTTPS API Error]:`, data);
      }
    } catch (error) {
      console.error(`❌ [Brevo Network Error]: ${error.message}`);
    }
  }

  if (!apiKey && !brevoApiKey) {
    console.warn(`ℹ️ RESEND_API_KEY not set in environment. Using server console OTP display.`);
  }

  // 3. Fallback Console Log Display (Ensures login never breaks even in local dev or network downtime)
  console.log('\n========================================');
  console.log(`📧 [RENDER CONSOLE OTP DISPLAY] To   : ${toEmail}`);
  console.log(`🔑 [RENDER CONSOLE OTP DISPLAY] Code : ${otp}`);
  console.log('========================================\n');
  return true;
};
