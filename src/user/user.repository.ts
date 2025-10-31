import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';  
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
