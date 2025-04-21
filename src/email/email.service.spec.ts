import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { User } from '../user/user.entity';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService: EmailService;
  let transporterMock;

  beforeEach(async () => {
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    })
      .overrideProvider(nodemailer.createTransport)
      .useValue(transporterMock)
      .compile();

    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  describe('sendPaymentSuccessEmail', () => {
    it('should send payment success email', async () => {
      const user: User = {
        email: 'oladipuporancho10@gmail.com',
        name: 'Rancho Ola',
        phoneNumber: '1234567890',
      };

      await emailService.sendPaymentSuccessEmail(user);

      expect(transporterMock.sendMail).toHaveBeenCalled();
      expect(transporterMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: user.email,
          subject: 'Payment Success - New Phone Number',
        }),
      );
    });
  });

  describe('sendRegistrationEmail', () => {
    it('should send registration email', async () => {
      const user: User = {
        email: 'user@example.com',
        name: 'John Doe',
      };

      await emailService.sendRegistrationEmail(user);

      expect(transporterMock.sendMail).toHaveBeenCalled();
      expect(transporterMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: user.email,
          subject: 'Welcome to Phane!',
        }),
      );
    });
  });
});
