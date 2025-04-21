import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { EmailService } from '../email/email.service';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentService {
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly emailService: EmailService,
  ) {
    if (!this.paystackSecretKey) {
      throw new Error('Paystack secret key is not set.');
    }
  }

  // Initiating Payment
  async initiatePayment(amount: number, email: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: amount * 100, // Amount in kobo
          email,
          reference: user.reference,
          callback_url: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/payment/callback',
          metadata: {
            userId: user.id,
            email: user.email,
            phone: user.phoneNumber || null,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data.status) {
        throw new InternalServerErrorException('Payment initialization failed');
      }

      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error?.response?.data || error.message);
      throw new InternalServerErrorException({
        message: 'Payment initiation failed',
        error: error?.response?.data || error.message,
      });
    }
  }

  // Verifying Payment
  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status) {
        const transaction = response.data.data;
        const user = await this.userRepository.findOne({
          where: { email: transaction.customer.email },
        });

        if (!user) {
          throw new InternalServerErrorException('User not found for reference');
        }

        const payment = new Payment();
        payment.user = user;
        payment.amount = transaction.amount / 100; // Converting amount to Naira
        payment.status = transaction.status;
        payment.transactionReference = transaction.reference;
        payment.paymentDate = new Date(transaction.paid_at);
        payment.fees = transaction.fees / 100; // Converting fees to Naira

        await this.paymentRepository.save(payment);
        await this.emailService.sendConfirmationEmail(user, payment);

        return {
          message: 'Payment successful',
          phoneNumber: user.phoneNumber,
          transactionDetails: response.data,
        };
      } else {
        console.error('Payment verification failed:', response.data);
        throw new InternalServerErrorException('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error?.response?.data || error.message);
      throw new InternalServerErrorException({
        message: 'Payment verification failed',
        error: error?.response?.data || error.message,
      });
    }
  }
}
