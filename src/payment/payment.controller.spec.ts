import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';

describe('PaymentController', () => {
  let paymentController: PaymentController;
  let paymentService: PaymentService;
  let userService: UserService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        PaymentService,
        UserService,
        EmailService,
      ],
    })
      .overrideProvider(PaymentService)
      .useValue({
        initiatePayment: jest.fn().mockResolvedValue({ status: 'success' }),
        verifyPayment: jest.fn().mockResolvedValue({ data: { status: 'success' } }),
      })
      .overrideProvider(UserService)
      .useValue({
        updatePaymentStatus: jest.fn().mockResolvedValue({ status: 'paid' }),
      })
      .overrideProvider(EmailService)
      .useValue({
        sendPaymentSuccessEmail: jest.fn(),
        sendRegistrationEmail: jest.fn(),
      })
      .compile();

    paymentController = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(paymentController).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should initiate payment successfully', async () => {
      const createPaymentDto = { amount: 1000, email: 'user@example.com' };
      const result = await paymentController.initiatePayment(createPaymentDto);
      expect(result.status).toBe('success');
      expect(paymentService.initiatePayment).toHaveBeenCalledWith(1000, 'user@example.com');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully and update user status', async () => {
      const reference = 'pay_ref_123';
      const result = await paymentController.verifyPayment({ reference });
      expect(result.message).toBe('Payment successful');
      expect(userService.updatePaymentStatus).toHaveBeenCalledWith(reference, 'paid');
    });
  });
});
