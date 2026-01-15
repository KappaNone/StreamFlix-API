import { ApiProperty } from '@nestjs/swagger';
import { QualityName, SubscriptionPlan } from '@prisma/client';

// Serializes plan metadata for the plan catalog endpoint.
export class SubscriptionPlanEntity implements SubscriptionPlan {
  constructor(partial: Partial<SubscriptionPlanEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    description: 'Price stored in cents to avoid floating point errors',
  })
  priceCents: number;

  @ApiProperty({ default: 'EUR' })
  currency: string;

  @ApiProperty({ enum: QualityName })
  maxQuality: QualityName;

  @ApiProperty({ default: 1 })
  concurrentStreams: number;

  @ApiProperty({ default: 30 })
  trialDays: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
