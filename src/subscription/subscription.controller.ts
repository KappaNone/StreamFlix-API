import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionEntity } from './entities/subscription.entity';
import { SubscriptionPlanEntity } from './entities/subscription-plan.entity';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InvitationEntity } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RedeemInvitationDto } from './dto/redeem-invitation.dto';

@Controller('subscriptions')
@ApiTags('subscriptions')
// HTTP surface for listing plans, managing subscriptions, and handling referrals.
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOkResponse({ type: SubscriptionPlanEntity, isArray: true })
  // Returns the catalog so clients can show pricing tiers.
  listPlans() {
    return this.subscriptionService.listPlans();
  }

  @Post()
  @ApiCreatedResponse({ type: SubscriptionEntity })
  // Creates a subscription or swaps the user's plan while applying trials/referrals.
  async create(@Body() dto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionService.createOrUpdateSubscription(dto);
    return new SubscriptionEntity(subscription);
  }

  @Get(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  // Fetches a single subscription with its plan + invitation metadata.
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const subscription = await this.subscriptionService.findOne(id);
    return new SubscriptionEntity(subscription);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SubscriptionEntity })
  // Lets the client toggle auto-renew, switch plans, or cancel.
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.subscriptionService.update(id, dto);
    return new SubscriptionEntity(subscription);
  }

  @Post('invitations')
  @ApiCreatedResponse({ type: InvitationEntity })
  // Issues a referral link for an existing customer.
  async createInvitation(@Body() dto: CreateInvitationDto) {
    const invitation = await this.subscriptionService.createInvitation(dto);
    return new InvitationEntity(invitation);
  }

  @Post('invitations/redeem')
  @ApiOkResponse({ type: InvitationEntity })
  // Validates an invite before the invitee attempts to subscribe.
  async redeemInvitation(@Body() dto: RedeemInvitationDto) {
    const invitation = await this.subscriptionService.redeemInvitation(dto);
    return new InvitationEntity(invitation);
  }
}
