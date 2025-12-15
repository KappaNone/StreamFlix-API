import { ApiProperty } from '@nestjs/swagger';
import { Subscription, SubscriptionStatus } from '@prisma/client';
import { SubscriptionPlanEntity } from './subscription-plan.entity';
import { InvitationEntity } from './invitation.entity';

// Shapes subscription responses returned through Swagger.
export class SubscriptionEntity implements Subscription {
  constructor(partial: Partial<SubscriptionEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  planId: number;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty()
  currentPeriodStart: Date;

  @ApiProperty()
  currentPeriodEnd: Date;

  @ApiProperty({ required: false, nullable: true })
  trialEndsAt: Date | null;

  @ApiProperty({ default: true })
  autoRenew: boolean;

  @ApiProperty({ default: 0 })
  discountPercent: number;

  @ApiProperty({ required: false, nullable: true })
  discountEndsAt: Date | null;

  @ApiProperty({ required: false, nullable: true })
  invitedByUserId: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => SubscriptionPlanEntity })
  plan?: SubscriptionPlanEntity;

  @ApiProperty({ type: () => InvitationEntity, required: false })
  invitation?: InvitationEntity | null;
}
