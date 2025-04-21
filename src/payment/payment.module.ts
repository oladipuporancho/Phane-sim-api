import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaystackController } from './paystack.controller';
import { User } from '../user/user.entity';
import { Payment } from './payment.entity';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Payment]), 
    forwardRef(() => UserModule),
    EmailModule,
  ],
  controllers: [PaymentController, PaystackController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
