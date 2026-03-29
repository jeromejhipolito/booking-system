import { Controller, Post, Get, Delete, Body, Param, Req, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { CreateWebhookSubscriptionDto } from './dto/create-webhook-subscription.dto';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('subscriptions')
  async createSubscription(
    @Body() dto: CreateWebhookSubscriptionDto,
    @Req() req: any,
  ) {
    const providerId = req.user?.providerId || req.user?.id;
    return this.webhookService.createSubscription(providerId, dto.url, dto.eventTypes);
  }

  @Get('subscriptions')
  async listSubscriptions(@Req() req: any) {
    const providerId = req.user?.providerId || req.user?.id;
    return this.webhookService.listSubscriptions(providerId);
  }

  @Delete('subscriptions/:id')
  async deactivateSubscription(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const providerId = req.user?.providerId || req.user?.id;
    await this.webhookService.deactivateSubscription(id, providerId);
    return { success: true };
  }

  @Get('deliveries')
  async listDeliveries(@Req() req: any) {
    const providerId = req.user?.providerId || req.user?.id;
    return this.webhookService.listDeliveries(providerId);
  }
}
