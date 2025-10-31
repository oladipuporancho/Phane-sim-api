import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EmailService } from '../email/email.service';
import { PaymentModule } from '../payment/payment.module'; 

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => PaymentModule)],
  providers: [UserService, EmailService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule], 
})
export class UserModule {}
