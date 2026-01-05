import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

// Supports plan switches, cancelation flags, and auto-renew updates.
export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ description: 'Switch to another subscription plan by code' })
  @IsOptional()
  @IsString()
  planCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiPropertyOptional({ description: 'Set subscription status directly', enum: SubscriptionStatus })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ description: 'Cancel at the end of the current period' })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;
}
