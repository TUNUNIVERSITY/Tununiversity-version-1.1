import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter only if SMTP is configured
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('✅ Email transporter configured');
} else {
  console.log('⚠️ SMTP not configured - emails will be skipped');
}

/**
 * Send email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<void>}
 */
export async function sendEmail(to, subject, html) {
  try {
    // Skip email sending if transporter not configured
    if (!transporter) {
      console.log('⚠️ SMTP not configured, skipping email to:', to);
      console.log('📧 Email subject:', subject);
      return { messageId: 'skipped-no-smtp' };
    }

    const mailOptions = {
      from: `"University Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Log but don't throw in development to allow login without email
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Continuing without email in development mode');
      return { messageId: 'failed-dev-mode' };
    }
    throw new Error('Failed to send email: ' + error.message);
  }
}

/**
 * Send verification email
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} token - Verification token
 */
export async function sendVerificationEmail(email, firstName, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to University Platform!</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName},</h2>
          <p>Thank you for registering with our University Management Platform.</p>
          <p>Please verify your email address by clicking the button below:</p>
          <center>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </center>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4CAF50;">${verificationUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 University Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, 'Verify Your Email Address', html);
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} token - Reset token
 */
export async function sendPasswordResetEmail(email, firstName, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
        }
        .header {
          background-color: #FF5722;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #FF5722;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 10px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName},</h2>
          <p>We received a request to reset your password for your University Platform account.</p>
          <p>Click the button below to reset your password:</p>
          <center>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </center>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #FF5722;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour.
          </div>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 University Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, 'Reset Your Password', html);
}

/**
 * Send login notification (when user attempts to login but not verified)
 * @param {string} email - User email
 * @param {string} firstName - User first name
 */
export async function sendLoginNotificationEmail(email, firstName) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
        }
        .header {
          background-color: #2196F3;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .info-box {
          background-color: #e3f2fd;
          border-left: 4px solid #2196F3;
          padding: 10px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Login Attempt Detected</h1>
        </div>
        <div class="content">
          <h2>Hello ${firstName},</h2>
          <p>We detected a login attempt to your account.</p>
          <div class="info-box">
            <strong>ℹ️ Note:</strong> Your account email is not yet verified. Please check your inbox for the verification email we sent earlier.
          </div>
          <p>If you need a new verification link, please use the "Resend Verification" option on the login page.</p>
          <p>If this wasn't you, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 University Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, 'Login Attempt - Email Verification Required', html);
}
