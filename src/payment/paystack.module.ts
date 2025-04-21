import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaystackController } from './paystack.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PaymentService],
  controllers: [PaystackController],
})
export class PaystackModule {}
