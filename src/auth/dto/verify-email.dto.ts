import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  verificationToken: string;
}
