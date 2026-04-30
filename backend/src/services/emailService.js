const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  async sendVerificationEmail(email, verificationCode) {
    try {
      // Check if Gmail credentials are configured
      const gmailUser = process.env.GMAIL_USER;
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

      if (gmailUser && gmailAppPassword &&
          gmailUser !== 'your-gmail-address@gmail.com' &&
          gmailAppPassword !== 'your-app-password') {

        // Use Gmail SMTP
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        console.log('📧 Using Gmail SMTP for email verification');

      } else {
        // Fallback to Ethereal Email for testing
        console.log('📧 Using Ethereal Email for testing (Gmail not configured)');

        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const mailOptions = {
        from: `"OleaCare" <${process.env.GMAIL_USER || 'noreply@oleacare.com'}>`,
        to: email,
        subject: 'OleaCare - Vérification de votre compte',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2e7d32;">Bienvenue sur OleaCare !</h2>
            <p>Merci de vous être inscrit. Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2e7d32; font-size: 32px; margin: 0;">${verificationCode}</h1>
            </div>
            <p>Ce code expire dans 10 minutes.</p>
            <p>Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
            <br>
            <p>Cordialement,<br>L'équipe OleaCare</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('');
      console.log('✅ Email de vérification envoyé avec succès !');

      if (gmailUser && gmailAppPassword) {
        console.log('📧 Email envoyé depuis Gmail :', gmailUser);
      } else {
        console.log('📧 Aperçu de l\'email :', nodemailer.getTestMessageUrl(info));
      }

      console.log('🔍 Code de vérification :', verificationCode);
      console.log('📬 Email destinataire :', email);
      console.log('⏰ Expire dans 10 minutes');
      console.log('');

      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email, resetCode) {
    try {
      const gmailUser = process.env.GMAIL_USER;
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

      if (gmailUser && gmailAppPassword &&
          gmailUser !== 'your-gmail-address@gmail.com' &&
          gmailAppPassword !== 'your-app-password') {

        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        console.log('📧 Using Gmail SMTP for password reset email');
      } else {
        console.log('📧 Using Ethereal Email for testing (Gmail not configured)');

        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const mailOptions = {
        from: `"OleaCare" <${process.env.GMAIL_USER || 'noreply@oleacare.com'}>`,
        to: email,
        subject: 'OleaCare - Réinitialisation du mot de passe',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2e7d32;">Réinitialisation du mot de passe</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe. Utilisez le code ci-dessous pour définir un nouveau mot de passe :</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2e7d32; font-size: 32px; margin: 0;">${resetCode}</h1>
            </div>
            <p>Ce code expire dans 10 minutes.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <br>
            <p>Cordialement,<br>L'équipe OleaCare</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('');
      console.log('✅ Password reset email sent successfully!');

      if (gmailUser && gmailAppPassword) {
        console.log('📧 Email sent from Gmail:', gmailUser);
      } else {
        console.log('📧 Email preview:', nodemailer.getTestMessageUrl(info));
      }

      console.log('🔍 Reset code:', resetCode);
      console.log('📬 Recipient email:', email);
      console.log('⏰ Expires in 10 minutes');
      console.log('');

      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();