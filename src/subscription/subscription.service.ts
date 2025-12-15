import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Invitation,
  InvitationStatus,
  Prisma,
  SubscriptionStatus,
  User,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RedeemInvitationDto } from './dto/redeem-invitation.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly subscriptionInclude: Prisma.SubscriptionInclude = {
    plan: true,
    invitation: true,
  };

  async listPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { priceCents: 'asc' },
    });
  }

  async findOne(id: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: this.subscriptionInclude,
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }

    return subscription;
  }

  async createOrUpdateSubscription(dto: CreateSubscriptionDto) {
    const { userId, planCode, invitationCode } = dto;
    const now = new Date();

    const [user, plan] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.subscriptionPlan.findUnique({ where: { code: planCode } }),
    ]);

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (!plan) {
      throw new NotFoundException(`Plan ${planCode} not found`);
    }

    const existing = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { not: SubscriptionStatus.CANCELED },
      },
      orderBy: { createdAt: 'desc' },
      include: this.subscriptionInclude,
    });

    const subscriptionCount = await this.prisma.subscription.count({
      where: { userId },
    });

    const isFirstSubscription = subscriptionCount === 0;

    let trialEndsAt: Date | null = null;
    if (isFirstSubscription && plan.trialDays > 0) {
      trialEndsAt = this.addDays(now, plan.trialDays);
    }

    let periodStart = trialEndsAt ?? now;
    if (existing) {
      trialEndsAt = existing.trialEndsAt;
      periodStart = now;
    }
    const periodEnd = this.addDays(periodStart, 30);

    const invitation = invitationCode
      ? await this.ensureInvitation(invitationCode, {
          id: user.id,
          email: user.email,
          referralDiscountUsed: user.referralDiscountUsed,
        })
      : null;

    const discountPercent = invitation
      ? invitation.discountPercent
      : existing?.discountPercent ?? 0;
    const discountEndsAt = invitation
      ? this.addDays(periodStart, invitation.discountDurationDays)
      : existing?.discountEndsAt ?? null;
    const invitedByUserId = invitation
      ? invitation.inviterId
      : existing?.invitedByUserId ?? null;

    const baseData: Prisma.SubscriptionUncheckedCreateInput = {
      userId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      trialEndsAt,
      autoRenew: true,
      discountPercent,
      discountEndsAt,
      invitedByUserId,
    };

    let subscription;
    if (existing) {
      subscription = await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          ...baseData,
          trialEndsAt: existing.trialEndsAt,
        },
        include: this.subscriptionInclude,
      });
    } else {
      subscription = await this.prisma.subscription.create({
        data: baseData,
        include: this.subscriptionInclude,
      });
    }

    if (invitation) {
      await this.prisma.$transaction([
        this.prisma.invitation.update({
          where: { id: invitation.id },
          data: {
            status: InvitationStatus.REDEEMED,
            redeemedAt: now,
            subscription: { connect: { id: subscription.id } },
          },
        }),
        this.prisma.user.update({
          where: { id: user.id },
          data: { referralDiscountUsed: true },
        }),
      ]);

      await this.applyInviterDiscount(invitation.inviterId, invitation);
    }

    return subscription;
  }

  async update(id: number, dto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: this.subscriptionInclude,
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${id} not found`);
    }

    const data: Prisma.SubscriptionUncheckedUpdateInput = {};
    const now = new Date();

    if (dto.planCode) {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { code: dto.planCode },
      });
      if (!plan) {
        throw new NotFoundException(`Plan ${dto.planCode} not found`);
      }
      data.planId = plan.id;
      data.status = SubscriptionStatus.ACTIVE;
      data.currentPeriodStart = now;
      data.currentPeriodEnd = this.addDays(now, 30);
      data.autoRenew = true;
    }

    if (typeof dto.autoRenew === 'boolean') {
      data.autoRenew = dto.autoRenew;
    }

    if (dto.cancelAtPeriodEnd) {
      data.autoRenew = false;
      data.status = SubscriptionStatus.CANCELED;
    }

    if (dto.status) {
      data.status = dto.status;
    }

    return this.prisma.subscription.update({
      where: { id },
      data,
      include: this.subscriptionInclude,
    });
  }

  async createInvitation(dto: CreateInvitationDto) {
    const inviter = await this.prisma.user.findUnique({
      where: { id: dto.inviterUserId },
    });

    if (!inviter) {
      throw new NotFoundException(`User ${dto.inviterUserId} not found`);
    }

    const normalizedEmail = dto.inviteeEmail.trim().toLowerCase();

    const existing = await this.prisma.invitation.findFirst({
      where: {
        inviterId: inviter.id,
        inviteeEmail: normalizedEmail,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      throw new BadRequestException('An active invitation already exists for this email.');
    }

    const discountPercent = dto.discountPercent ?? 25;
    const discountDurationDays = dto.discountDurationDays ?? 30;

    return this.prisma.invitation.create({
      data: {
        code: this.generateInviteCode(),
        inviterId: inviter.id,
        inviteeEmail: normalizedEmail,
        discountPercent,
        discountDurationDays,
        expiresAt: this.addDays(new Date(), 30),
      },
    });
  }

  async redeemInvitation(dto: RedeemInvitationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    return this.ensureInvitation(dto.code, {
      id: user.id,
      email: user.email,
      referralDiscountUsed: user.referralDiscountUsed,
    });
  }

  private async applyInviterDiscount(inviterId: number, invitation: Invitation) {
    const inviter = await this.prisma.user.findUnique({ where: { id: inviterId } });

    if (!inviter || inviter.referralDiscountUsed) {
      return;
    }

    const inviterSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: inviterId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { currentPeriodEnd: 'desc' },
    });

    if (!inviterSubscription) {
      await this.prisma.user.update({
        where: { id: inviterId },
        data: { referralDiscountUsed: true },
      });
      return;
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { id: inviterSubscription.id },
        data: {
          discountPercent: invitation.discountPercent,
          discountEndsAt: this.addDays(now, invitation.discountDurationDays),
        },
      }),
      this.prisma.user.update({
        where: { id: inviterId },
        data: { referralDiscountUsed: true },
      }),
    ]);
  }

  private async ensureInvitation(
    code: string,
    user: Pick<User, 'id' | 'email' | 'referralDiscountUsed'>,
  ) {
    if (user.referralDiscountUsed) {
      throw new BadRequestException('Referral discount already used by this account');
    }

    const invitation = await this.prisma.invitation.findUnique({ where: { code } });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const now = new Date();
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation already used or canceled');
    }

    if (invitation.expiresAt.getTime() < now.getTime()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation expired');
    }

    if (invitation.inviteeEmail.toLowerCase() !== user.email.toLowerCase()) {
      throw new BadRequestException('Invitation email mismatch');
    }

    return invitation;
  }

  private generateInviteCode() {
    return randomBytes(6).toString('hex').substring(0, 10).toUpperCase();
  }

  private addDays(date: Date, days: number) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }
}
