import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class EmailService {
  constructor() {
    // Validate required environment variables
    this.validateConfig();
    
    // Gmail App Password should have no spaces
    const emailPassword = process.env.EMAIL_PASSWORD?.replace(/\s/g, '');
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: emailPassword
      }
    });

    // Verify transporter configuration
    this.verifyConnection();
  }

  validateConfig() {
    const requiredVars = {
      EMAIL_USERNAME: process.env.EMAIL_USERNAME,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
      ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL
    };

    const missing = [];
    for (const [key, value] of Object.entries(requiredVars)) {
      if (!value) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      console.error('❌ Missing email configuration in .env file:');
      missing.forEach(key => console.error(`   - ${key}`));
      console.error('\n📝 Please add these to your .env file:');
      console.error('   EMAIL_USERNAME=idowujo042@gmail.com');
      console.error('   EMAIL_PASSWORD=yfmp hdov stds kxdx');
      console.error('   ADMIN_NOTIFICATION_EMAIL=tradex@gmail.com');
    } else {
      console.log('✅ Email configuration loaded:');
      console.log(`   From: ${process.env.EMAIL_USERNAME}`);
      console.log(`   To: ${process.env.ADMIN_NOTIFICATION_EMAIL}`);
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service ready to send messages');
    } catch (error) {
      console.error('❌ Email service verification failed:', error.message);
      console.error('\n🔍 Troubleshooting:');
      console.error('   1. Check EMAIL_USERNAME is correct');
      console.error('   2. Check EMAIL_PASSWORD is a Gmail App Password (not regular password)');
      console.error('   3. Generate App Password at: https://myaccount.google.com/apppasswords');
    }
  }

  async sendNewMessageNotification(visitorId, message) {
    try {
      const mailOptions = {
        from: `"TradeX Support" <${process.env.EMAIL_USERNAME}>`,
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `New Support Message from Visitor ${visitorId.substring(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${process.env.EMAIL_LOGO_URL || ''}" alt="TradeX Logo" style="max-width: 150px; height: auto;">
            </div>
            <h2 style="color: #1e40af;">New Support Message</h2>
            <p><strong>Visitor ID:</strong> ${visitorId}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
              ${message}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Please respond to this message through the admin dashboard.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} TradeX. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email notification sent successfully');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   To: ${process.env.ADMIN_NOTIFICATION_EMAIL}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      
      // Provide specific error guidance
      if (error.code === 'EAUTH') {
        console.error('\n🔑 Authentication Error - Check these:');
        console.error('   1. EMAIL_PASSWORD must be a Gmail App Password');
        console.error('   2. Enable 2-Step Verification in Google Account');
        console.error('   3. Generate App Password: https://myaccount.google.com/apppasswords');
        console.error('   4. Copy EXACTLY (no spaces): yfmp hdov stds kxdx');
      } else if (error.code === 'ESOCKET') {
        console.error('\n🌐 Network Error - Check your internet connection');
      }
      
      return false;
    }
  }
}

export default new EmailService();