import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';  // Assuming User entity is in the same directory
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Update user's phone number based on transaction reference
  async updateUserPhoneNumber(transactionReference: string, newPhoneNumber: string) {
    const user = await this.userRepository.findOne({ where: { reference: transactionReference } });
    if (user) {
      user.phoneNumber = newPhoneNumber;
      await this.userRepository.save(user);
      return user;
    }
    throw new Error('User not found');
  }
}
