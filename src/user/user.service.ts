import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto, image: string): Promise<User> {
    const reference = uuidv4();

    const user = this.userRepository.create({
      ...createUserDto,
      image,
      hasPaid: false,
      phoneNumber: 'not generated',
      createdAt: new Date().toISOString(),
      reference,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      await this.emailService.sendRegistrationEmail(savedUser);
      return savedUser;
    } catch (error) {
      console.error('Error saving user:', error);
      throw new InternalServerErrorException({
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }

  async updatePaymentStatus(reference: string, status: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { reference } });

      if (!user) {
        throw new NotFoundException(`User not found for reference: ${reference}`);
      }

      user.hasPaid = status === 'paid';

      if (!user.phoneNumber || user.phoneNumber === 'not generated') {
        user.phoneNumber = this.generatePhoneNumber();
      }

      const updatedUser = await this.userRepository.save(user);

      return updatedUser;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new InternalServerErrorException({
        message: 'Error verifying payment',
        error: 'Error updating payment status',
      });
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return user;
  }

  async findUserByReference(reference: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { reference } });
    return user || null;
  }

  private generatePhoneNumber(): string {
    const prefix = '070';
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
    return prefix + randomDigits;
  }
}
