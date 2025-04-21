import { IsEmail, IsNotEmpty, IsNumber, IsString, Length, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(11, 11, { message: 'NIN must be 11 digits' })
  nin: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  age: number;

  @IsNotEmpty()
  @IsString()
  dob: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
