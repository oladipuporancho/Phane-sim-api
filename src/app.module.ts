import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PaymentModule } from './payment/payment.module';
import { EmailModule } from './email/email.module';
import { User } from './user/user.entity';
import { Payment } from './payment/payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Payment],
      synchronize: true,
    }),
    UserModule,
    PaymentModule,
    EmailModule,
  ],
})
export class AppModule {}
