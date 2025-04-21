import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaystackController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  async initiatePayment(
    @Body('amount') amount: number,
    @Body('email') email: string,
  ) {
    return this.paymentService.initiatePayment(amount, email);
  }

  @Get('verify')
  async verifyPayment(@Query('reference') reference: string) {
    return this.paymentService.verifyPayment(reference);
  }
}
