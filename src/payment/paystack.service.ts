import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class PaymentService {
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    if (!this.paystackSecretKey) {
      throw new Error('Paystack secret key is not set.');
    }
  }

  async initiatePayment(amount: number, email: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: amount * 100, // Paystack uses kobo
          email,
          callback_url: 'https://3268-102-89-68-150.ngrok-free.app/', // Change to your callback URL
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const reference = response.data.data.reference;

      // Log and save reference to the user
      console.log('Payment initiated with reference:', reference);

      await this.userRepository.update({ email }, { reference });

      return response.data;
    } catch (error) {
      console.error('❌ Error initiating payment:', error?.response?.data || error.message);
      throw new InternalServerErrorException({
        message: 'Payment initiation failed',
        error: error?.response?.data || error.message,
      });
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      console.log('🔍 Verifying payment for reference:', reference);

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      // Check if the response from Paystack is successful
      if (response.data.status === 'success') {
        console.log('Paystack verification response:', response.data);

        return {
          message: 'Payment successful',
          transactionDetails: response.data,
        };
      } else {
        console.error('Paystack verification failed:', response.data);
        throw new InternalServerErrorException('Payment verification failed');
      }
    } catch (error) {
      console.error(' Error verifying payment:', error?.response?.data || error.message);
      throw new InternalServerErrorException({
        message: 'Payment verification failed',
        error: error?.response?.data || error.message,
      });
    }
  }
}
