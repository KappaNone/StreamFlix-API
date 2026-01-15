import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

// Request body for issuing referral links.
export class CreateInvitationDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  inviterUserId: number;

  @ApiProperty()
  @IsEmail()
  inviteeEmail: string;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsPositive()
  discountDurationDays?: number;
}
