import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateWebhookSubscriptionDto } from '../dto/create-webhook-subscription.dto';

describe('CreateWebhookSubscriptionDto', () => {
  const validData = {
    url: 'https://example.com/webhook',
    eventTypes: ['booking.confirmed'],
  };

  it('accepts valid HTTPS URL with event types', async () => {
    const dto = plainToInstance(CreateWebhookSubscriptionDto, validData);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects missing URL', async () => {
    const dto = plainToInstance(CreateWebhookSubscriptionDto, { eventTypes: ['booking.confirmed'] });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'url')).toBe(true);
  });

  it('rejects HTTP URL (must be HTTPS)', async () => {
    const dto = plainToInstance(CreateWebhookSubscriptionDto, {
      ...validData,
      url: 'http://example.com/webhook',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'url')).toBe(true);
  });

  it('rejects empty eventTypes array', async () => {
    const dto = plainToInstance(CreateWebhookSubscriptionDto, {
      ...validData,
      eventTypes: [],
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'eventTypes')).toBe(true);
  });

  it('rejects URL over 2048 chars', async () => {
    const dto = plainToInstance(CreateWebhookSubscriptionDto, {
      ...validData,
      url: 'https://example.com/' + 'a'.repeat(2040),
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'url')).toBe(true);
  });

  it('accepts multiple valid event types', async () => {
    const dto = plainToInstance(CreateWebhookSubscriptionDto, {
      ...validData,
      eventTypes: ['booking.confirmed', 'booking.cancelled', 'booking.rescheduled'],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects event types not matching pattern', async () => {
    const dto = plainToInstance(CreateWebhookSubscriptionDto, {
      ...validData,
      eventTypes: ['INVALID_FORMAT'],
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'eventTypes')).toBe(true);
  });
});
