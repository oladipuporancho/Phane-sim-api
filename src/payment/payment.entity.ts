import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // Add userId for easy access

  @ManyToOne(() => User, user => user.payments, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string;

  @Column()
  transactionReference: string;

  @Column()
  paymentDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  fees: number;
}
