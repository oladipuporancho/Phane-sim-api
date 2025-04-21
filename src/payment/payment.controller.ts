import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
  Get,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UserService } from '../user/user.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
  ) {}

  @Post('initiate')
  async initiatePayment(@Body() body: { amount: number; email: string }) {
    const { amount, email } = body;
    if (!amount || !email) {
      throw new BadRequestException('Amount and email are required');
    }

    try {
      const paymentResponse = await this.paymentService.initiatePayment(amount, email);
      return {
        message: 'Payment initiation successful',
        paymentUrl: paymentResponse.data.authorization_url,
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new InternalServerErrorException('Failed to initiate payment');
    }
  }

  @Post('verify')
  async verifyPayment(@Body() body: { reference: string }) {
    const { reference } = body;
    if (!reference) {
      throw new BadRequestException('Reference is required');
    }

    try {
      return await this.handleVerification(reference);
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new InternalServerErrorException('Payment verification failed');
    }
  }

  @Get('callback')
  async handleCallback(@Query('reference') reference: string) {
    if (!reference) {
      throw new BadRequestException('Reference is required in callback');
    }

    try {
      return await this.handleVerification(reference);
    } catch (error) {
      console.error('Error in callback verification:', error);
      throw new InternalServerErrorException('Callback verification failed');
    }
  }

  private async handleVerification(reference: string) {
    try {
      const user = await this.userService.findUserByReference(reference);
      if (!user) {
        console.error('User not found for reference:', reference);
        throw new InternalServerErrorException('User not found for the provided reference');
      }

      console.log('User found:', user.email);

      const verification = await this.paymentService.verifyPayment(reference);
      const status = verification?.transactionDetails?.data?.status;

      if (status === 'success') {
        const updatedUser = await this.userService.updatePaymentStatus(reference, 'paid');
        return {
          message: 'Payment successful',
          phoneNumber: updatedUser.phoneNumber,
        };
      }

      return { message: 'Payment failed or not verified' };
    } catch (error) {
      console.error('Error during payment verification:', error);
      throw new InternalServerErrorException({
        message: 'Payment verification failed',
        error: error.message || 'Unknown error occurred',
      });
    }
  }
}
