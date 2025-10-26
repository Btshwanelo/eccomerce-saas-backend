// Email Verification Template
const emailVerification = function ({ username, verification_link }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Rapid Human AI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px 30px;
        }
        .logo {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo-text {
            font-size: 28px;
            font-weight: bold;
            color: #4a4a4a;
            letter-spacing: 2px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background-color: #4a4a4a;
            border-radius: 50%;
            margin: 0 auto 10px;
            position: relative;
        }
        .logo-icon::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 8px;
            background-color: white;
            border-radius: 50% 50% 0 0;
        }
        .logo-icon::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 16px;
            background-color: white;
            border-radius: 50%;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 30px;
            text-align: left;
        }
        .content {
            line-height: 1.6;
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #777777;
        }
        .signature {
            margin-top: 30px;
            font-size: 16px;
            color: #333333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-icon"></div>
            <div class="logo-text">RAPID HUMAN AI</div>
        </div>
        
        <h1>Email Verification</h1>
        
        <div class="content">
            <p>Hi ${username},</p>
            
            <p>Thank you for signing up for Rapid Human AI!</p>
            
            <p>To get started, please verify your email address by clicking the link below:</p>
            
            <a href="${verification_link}" class="cta-button">Verify Email Address</a>
            
            <p>If you did not create an account, you can safely ignore this email.</p>
        </div>
        
        <div class="signature">
            <p>Best,<br>
            The Rapid Human AI Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you as part of your Rapid Human AI account setup. If you'd rather not receive this kind of email, you can unsubscribe or manage your email preferences.</p>
            <p>© 2025 Rapid Human AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Password Reset Request Template
const passwordResetRequest = function ({ username, reset_link }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request - Rapid Human AI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px 30px;
        }
        .logo {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo-text {
            font-size: 28px;
            font-weight: bold;
            color: #4a4a4a;
            letter-spacing: 2px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background-color: #4a4a4a;
            border-radius: 50%;
            margin: 0 auto 10px;
            position: relative;
        }
        .logo-icon::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 8px;
            background-color: white;
            border-radius: 50% 50% 0 0;
        }
        .logo-icon::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 16px;
            background-color: white;
            border-radius: 50%;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 30px;
            text-align: left;
        }
        .content {
            line-height: 1.6;
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        .cta-button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #777777;
        }
        .signature {
            margin-top: 30px;
            font-size: 16px;
            color: #333333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-icon"></div>
            <div class="logo-text">RAPID HUMAN AI</div>
        </div>
        
        <h1>Password Reset Request</h1>
        
        <div class="content">
            <p>Hi ${username},</p>
            
            <p>We received a request to reset your password for your Rapid Human AI account.</p>
            
            <p>To reset your password, click the link below:</p>
            
            <a href="${reset_link}" class="cta-button">Reset Password</a>
            
            <p>If you did not request a password reset, please ignore this email or contact support.</p>
        </div>
        
        <div class="signature">
            <p>Best,<br>
            The Rapid Human AI Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you as part of your Rapid Human AI account security. If you'd rather not receive this kind of email, you can unsubscribe or manage your email preferences.</p>
            <p>© 2025 Rapid Human AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Password Reset Confirmation Template
const passwordResetConfirmation = function ({ username }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Confirmation - Rapid Human AI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px 30px;
        }
        .logo {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo-text {
            font-size: 28px;
            font-weight: bold;
            color: #4a4a4a;
            letter-spacing: 2px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background-color: #4a4a4a;
            border-radius: 50%;
            margin: 0 auto 10px;
            position: relative;
        }
        .logo-icon::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 8px;
            background-color: white;
            border-radius: 50% 50% 0 0;
        }
        .logo-icon::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 16px;
            background-color: white;
            border-radius: 50%;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 30px;
            text-align: left;
        }
        .content {
            line-height: 1.6;
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        .success-badge {
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #777777;
        }
        .signature {
            margin-top: 30px;
            font-size: 16px;
            color: #333333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-icon"></div>
            <div class="logo-text">RAPID HUMAN AI</div>
        </div>
        
        <h1>Password Reset Successful</h1>
        
        <div class="content">
            <p>Hi ${username},</p>
            
            <div class="success-badge">✓ Password Updated</div>
            
            <p>This is a confirmation that your password for your Rapid Human AI account has been successfully reset.</p>
            
            <p>If you did not perform this action, please contact our support team immediately.</p>
        </div>
        
        <div class="signature">
            <p>Best,<br>
            The Rapid Human AI Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you as part of your Rapid Human AI account security. If you'd rather not receive this kind of email, you can unsubscribe or manage your email preferences.</p>
            <p>© 2025 Rapid Human AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Welcome Template
const welcome = function ({ username }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Rapid Human AI</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 40px 30px;
        }
        .logo {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo-text {
            font-size: 28px;
            font-weight: bold;
            color: #4a4a4a;
            letter-spacing: 2px;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background-color: #4a4a4a;
            border-radius: 50%;
            margin: 0 auto 10px;
            position: relative;
        }
        .logo-icon::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 12px;
            height: 8px;
            background-color: white;
            border-radius: 50% 50% 0 0;
        }
        .logo-icon::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 16px;
            background-color: white;
            border-radius: 50%;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #333333;
            margin-bottom: 30px;
            text-align: left;
        }
        .content {
            line-height: 1.6;
            font-size: 16px;
            color: #555555;
            margin-bottom: 30px;
        }
        .welcome-badge {
            background-color: #007bff;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #777777;
        }
        .signature {
            margin-top: 30px;
            font-size: 16px;
            color: #333333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-icon"></div>
            <div class="logo-text">RAPID HUMAN AI</div>
        </div>
        
        <h1>Welcome to Rapid Human AI</h1>
        
        <div class="content">
            <p>Hi ${username},</p>
            
            <div class="welcome-badge">🎉 Welcome Aboard!</div>
            
            <p>Welcome to Rapid Human AI—your platform for rapid ideation and innovation!</p>
            
            <p>We're excited to have you on board. Start creating, collaborating, and turning your ideas into reality.</p>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p><strong>Happy innovating!</strong></p>
        </div>
        
        <div class="signature">
            <p>Best,<br>
            The Rapid Human AI Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you as part of your Rapid Human AI welcome series. If you'd rather not receive this kind of email, you can unsubscribe or manage your email preferences.</p>
            <p>© 2025 Rapid Human AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `;
};

// Export all templates
module.exports = {
  emailVerification,
  passwordResetRequest,
  passwordResetConfirmation,
  welcome,
};
