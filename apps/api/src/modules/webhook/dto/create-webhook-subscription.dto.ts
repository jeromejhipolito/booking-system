import {
  IsUrl,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateWebhookSubscriptionDto {
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: 'Webhook URL must use HTTPS' },
  )
  @MaxLength(2048)
  url: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one event type is required' })
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  @Matches(/^[a-z]+\.[a-z_]+$/, {
    each: true,
    message: 'Event types must match pattern: domain.event_name (e.g. booking.confirmed)',
  })
  eventTypes: string[];
}
