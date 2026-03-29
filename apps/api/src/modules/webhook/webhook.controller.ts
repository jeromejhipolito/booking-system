import { Controller, Post, Get, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('subscriptions')
  async createSubscription(
    @Body() body: { url: string; eventTypes: string[] },
    @Req() req: any,
  ) {
    const providerId = req.user?.providerId || req.user?.id;
    return this.webhookService.createSubscription(providerId, body.url, body.eventTypes);
  }

  @Get('subscriptions')
  async listSubscriptions(@Req() req: any) {
    const providerId = req.user?.providerId || req.user?.id;
    return this.webhookService.listSubscriptions(providerId);
  }

  @Delete('subscriptions/:id')
  async deactivateSubscription(@Param('id') id: string, @Req() req: any) {
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
