import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({ default: false })
  referralDiscountUsed: boolean;

  @ApiProperty({ default: false })
  emailVerified: boolean;

  @Exclude()
  verificationToken: string | null;

  @Exclude()
  verificationTokenExpiresAt: Date | null;

  @Exclude()
  failedLoginAttempts: number;

  @Exclude()
  accountLockedUntil: Date | null;

  @Exclude()
  passwordResetToken: string | null;

  @Exclude()
  passwordResetTokenExpiresAt: Date | null;
}
