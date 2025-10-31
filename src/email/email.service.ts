import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from '../user/user.entity';
import { Payment } from '../payment/payment.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      this.transporter.verify((error) => {
        if (error) {
          this.logger.error('Email transporter verification failed:', error);
        } else {
          this.logger.log('Email transporter is ready to send messages');
        }
      });
    } catch (error) {
      this.logger.error('Failed to create email transporter:', error);
    }
  }

  async sendRegistrationEmail(user: User): Promise<void> {
    if (!user || !user.email) {
      this.logger.warn('Cannot send registration email: Invalid user or missing email');
      return;
    }

    try {
      this.logger.log(`Sending registration email to ${user.email}`);

      const emailContent = this.generateRegistrationEmail(user);

      await this.transporter.sendMail({
        from: `"Phane SIM" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to Phane SIM!',
        html: emailContent,
      });

      this.logger.log(`Registration email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send registration email to ${user.email}:`, error);
    }
  }

  private generateRegistrationEmail(user: User): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2c3e50;">👋 Welcome to Phane SIM</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for registering with Phane SIM.</p>
            <p><strong>NIN:</strong> ${user.nin}</p>
            <p>Once your payment is confirmed, your new phone number will be generated and sent to you.</p>
            <br />
            <p style="color: #95a5a6;">We’re excited to have you on board! If you have any questions, feel free to reach out to our support team.</p>
            <footer style="font-size: 12px; text-align: center; color: #7f8c8d;">
              <p>&copy; ${new Date().getFullYear()} Phane SIM. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    `;
  }

  async sendConfirmationEmail(user: User, transaction: Payment): Promise<void> {
    if (!user || !user.email) {
      this.logger.warn('Cannot send confirmation email: Invalid user or missing email');
      return;
    }

    try {
      this.logger.log(`Sending payment confirmation email to ${user.email}`);

      const emailContent = this.generatePaymentConfirmationEmail(user, transaction);

      await this.transporter.sendMail({
        from: `"Phane SIM" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Payment Confirmation – Phane SIM',
        html: emailContent,
      });

      this.logger.log(`Confirmation email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to ${user.email}:`, error);
    }
  }

  private generatePaymentConfirmationEmail(user: User, transaction: Payment): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #2c3e50;">🎉 Payment Successful</h2>
            <p>Hi ${user.name},</p>
            <p>Your payment has been confirmed. Here are the details:</p>
            <p><strong>NIN:</strong> ${user.nin}</p>
            <p><strong>New Phone Number:</strong> ${user.phoneNumber}</p>
            <p><strong>Amount Paid:</strong> ${transaction.amount}</p>
            <p><strong>Transaction Reference:</strong> ${transaction.transactionReference}</p>
            <br />
            <p style="color: #95a5a6;">Thank you for choosing Phane SIM! If you have any questions, feel free to reach out to our support team.</p>
            <footer style="font-size: 12px; text-align: center; color: #7f8c8d;">
              <p>&copy; ${new Date().getFullYear()} Phane SIM. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    `;
  }
  async testEmailConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error('Email configuration test failed:', error);
      return false;
    }
  }
}
