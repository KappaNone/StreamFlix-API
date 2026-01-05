import { ApiProperty } from '@nestjs/swagger';
import { Invitation, InvitationStatus } from '@prisma/client';

// Response wrapper for referral invitations.
export class InvitationEntity implements Invitation {
  constructor(partial: Partial<InvitationEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  inviterId: number;

  @ApiProperty()
  inviteeEmail: string;

  @ApiProperty({ enum: InvitationStatus })
  status: InvitationStatus;

  @ApiProperty({ default: 25 })
  discountPercent: number;

  @ApiProperty({ default: 30 })
  discountDurationDays: number;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty({ required: false, nullable: true })
  redeemedAt: Date | null;

  @ApiProperty({ required: false, nullable: true })
  subscriptionId: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
