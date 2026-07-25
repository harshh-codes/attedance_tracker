require('dotenv').config();
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
const SENDER_EMAIL = process.env.EMAIL_FROM || '"Landmark Developers HR" <noreply@landmarkdevelopers.com>';

/**
 * Configure Nodemailer Transporter
 */
const createTransporter = async () => {
  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : null;
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
  const rawPass = process.env.SMTP_PASS || '';
  const pass = rawPass.replace(/\s+/g, ''); // Automatically strip spaces from Gmail App Password
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (host && user && pass) {
    return nodemailer.createTransport({
      service: host.includes('gmail') ? 'gmail' : undefined,
      host: host.includes('gmail') ? undefined : host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Development Fallback: Create test SMTP account via Ethereal or Json Transport
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (err) {
    logger.warn('Failed to create Ethereal SMTP test account. Falling back to console email logger.');
    return null;
  }
};

/**
 * Send Email Verification Link to newly registered employee
 */
const sendVerificationEmail = async (toEmail, firstName, verificationToken) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const subject = 'Action Required: Verify Your Email Address - Landmark Developers';
  const textContent = `Hello ${firstName},\n\nThank you for self-registering with Landmark Developers. Please verify your email address by clicking the link below:\n\n${verifyUrl}\n\nOnce verified, your registration will be reviewed by an Administrator.\n\nBest regards,\nLandmark Developers Team`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; borderRadius: 12px;">
      <div style="max-width: 550px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2 style="color: #f59e0b; margin-top: 0;">Landmark Developers</h2>
        <h3 style="color: #ffffff;">Email Address Verification</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Hello <strong>${firstName}</strong>,
        </p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Thank you for self-registering for the Employee Attendance Tracking System. Please click the button below to verify your email address:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #f59e0b; color: #0f172a; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; display: inline-block;">
            Verify Email Address Now
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">
          Or copy and paste this link in your browser:<br />
          <a href="${verifyUrl}" style="color: #38bdf8;">${verifyUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 11px; margin-bottom: 0;">
          If you did not register for an account, please ignore this email.
        </p>
      </div>
    </div>
  `;

  // Log prominently to console / winston for dev visibility
  console.log('\n======================================================');
  console.log('📧 OUTGOING EMAIL VERIFICATION DISPATCHED');
  console.log(`To: ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Verification URL: ${verifyUrl}`);
  console.log('======================================================\n');

  try {
    const transporter = await createTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: SENDER_EMAIL,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent
      });

      if (info.messageId && nodemailer.getTestMessageUrl) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info(`✉️ Ethereal Mail Preview URL: ${previewUrl}`);
          console.log(`🔗 Preview Email Online (Ethereal): ${previewUrl}`);
        }
      }
    }
  } catch (err) {
    logger.error(`Error sending email to ${toEmail}: ${err.message}`);
    console.error(`❌ SMTP Email Delivery Failed for ${toEmail}:`, err.message);
  }
};

/**
 * Send Approval Email when Admin approves registration
 */
const sendApprovalEmail = async (toEmail, firstName, employeeId, department) => {
  const loginUrl = `${FRONTEND_URL}/login`;
  const subject = 'Account Approved: Welcome to Landmark Developers';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px;">
      <div style="max-width: 550px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2 style="color: #10b981; margin-top: 0;">Registration Approved!</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Hello <strong>${firstName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">
          Your registration has been approved by the Administrator.
        </p>
        <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="color: #f59e0b; margin: 0 0 8px 0; font-size: 13px;"><strong>Employee ID:</strong> ${employeeId}</p>
          <p style="color: #38bdf8; margin: 0; font-size: 13px;"><strong>Department:</strong> ${department}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}" style="background-color: #10b981; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; display: inline-block;">
            Sign In to Employee Portal
          </a>
        </div>
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`📧 OUTGOING APPROVAL EMAIL DISPATCHED`);
  console.log(`To: ${toEmail} | Employee ID: ${employeeId} | Dept: ${department}`);
  console.log(`======================================================\n`);

  try {
    const transporter = await createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: toEmail,
        subject,
        html: htmlContent
      });
    }
  } catch (err) {
    logger.error(`Error sending approval email to ${toEmail}: ${err.message}`);
  }
};

/**
 * Send Rejection Email when Admin rejects registration
 */
const sendRejectionEmail = async (toEmail, firstName, rejectionReason) => {
  const subject = 'Registration Update - Landmark Developers';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px;">
      <div style="max-width: 550px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2 style="color: #f43f5e; margin-top: 0;">Registration Application Status</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Hello <strong>${firstName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">
          Your registration request for Landmark Developers Attendance Portal was reviewed. Unfortunately, your application could not be approved at this time.
        </p>
        <div style="background-color: #0f172a; border-left: 4px solid #f43f5e; padding: 12px; margin: 16px 0;">
          <p style="color: #f43f5e; margin: 0; font-size: 13px;"><strong>Reason:</strong> ${rejectionReason}</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Please contact your HR administrator if you believe this is an error.</p>
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`📧 OUTGOING REJECTION EMAIL DISPATCHED`);
  console.log(`To: ${toEmail} | Reason: ${rejectionReason}`);
  console.log(`======================================================\n`);

  try {
    const transporter = await createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: toEmail,
        subject,
        html: htmlContent
      });
    }
  } catch (err) {
    logger.error(`Error sending rejection email to ${toEmail}: ${err.message}`);
  }
};

/**
 * Send Password Reset Email with Token Link
 */
const sendPasswordResetEmail = async (toEmail, firstName, rawToken) => {
  const resetUrl = `${FRONTEND_URL}/reset-password/${rawToken}`;
  const subject = 'Password Reset Request - Landmark Developers';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px;">
      <div style="max-width: 550px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
        <h2 style="color: #f59e0b; margin-top: 0;">Landmark Developers</h2>
        <h3 style="color: #ffffff;">Password Reset Request</h3>
        <p style="color: #cbd5e1; font-size: 14px;">Hello <strong>${firstName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          We received a request to reset the password for your Landmark Developers account. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #f59e0b; color: #0f172a; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; display: inline-block;">
            Reset Password Now
          </a>
        </div>
        <p style="color: #cbd5e1; font-size: 12px;">
          ⏱️ <strong>Note:</strong> This link is valid for <strong>15 minutes</strong> only and can be used only once.
        </p>
        <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">
          If the button above does not work, copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #38bdf8;">${resetUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 11px; margin-bottom: 0;">
          If you did not request a password reset, please ignore this email or contact support if you have security concerns.
        </p>
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`📧 OUTGOING PASSWORD RESET EMAIL DISPATCHED`);
  console.log(`To: ${toEmail}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`======================================================\n`);

  try {
    const transporter = await createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: SENDER_EMAIL,
        to: toEmail,
        subject,
        html: htmlContent
      });
    }
  } catch (err) {
    logger.error(`Error sending password reset email to ${toEmail}: ${err.message}`);
    console.error(`❌ SMTP Email Delivery Failed for ${toEmail}:`, err.message);
  }
};

module.exports = {
  sendVerificationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPasswordResetEmail
};
