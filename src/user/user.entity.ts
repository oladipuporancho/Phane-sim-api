import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Payment } from '../payment/payment.entity'; // Import Payment entity

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  nin: string;

  @Column()
  age: number;

  @Column()
  dob: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  hasPaid: boolean;

  @Column({ nullable: true, default: 'not generated' })
  phoneNumber: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ unique: true, default: () => 'gen_random_uuid()' })
  reference: string;


  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];
}
