import { WebhookService } from '../webhook.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let subscriptionRepo: any;
  let deliveryRepo: any;

  beforeEach(() => {
    subscriptionRepo = {
      create: jest.fn((data) => data),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'sub-1' })),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
    };
    deliveryRepo = {
      create: jest.fn((data) => data),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: 'del-1' })),
      findOneOrFail: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    service = new WebhookService(subscriptionRepo, deliveryRepo);
  });

  describe('createSubscription', () => {
    it('generates a 64-char hex secret', async () => {
      const result = await service.createSubscription('prov-1', 'https://example.com', ['booking.confirmed']);
      expect(result.secret).toMatch(/^[0-9a-f]{64}$/);
    });

    it('saves with correct provider and URL', async () => {
      await service.createSubscription('prov-1', 'https://example.com/hook', ['booking.confirmed']);
      expect(subscriptionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ providerId: 'prov-1', url: 'https://example.com/hook' }),
      );
    });
  });

  describe('findActiveByProviderAndEvent', () => {
    it('filters subscriptions by eventTypes', async () => {
      subscriptionRepo.find.mockResolvedValue([
        { id: 'sub-1', eventTypes: ['booking.confirmed', 'booking.cancelled'], isActive: true },
        { id: 'sub-2', eventTypes: ['booking.rescheduled'], isActive: true },
      ]);

      const result = await service.findActiveByProviderAndEvent('prov-1', 'booking.confirmed');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sub-1');
    });
  });

  describe('signPayload', () => {
    it('produces consistent HMAC-SHA256', () => {
      const sig1 = service.signPayload('{"test":1}', 'secret');
      const sig2 = service.signPayload('{"test":1}', 'secret');
      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces different signatures for different payloads', () => {
      const sig1 = service.signPayload('{"a":1}', 'secret');
      const sig2 = service.signPayload('{"b":2}', 'secret');
      expect(sig1).not.toBe(sig2);
    });

    it('produces different signatures for different secrets', () => {
      const sig1 = service.signPayload('same', 'secret1');
      const sig2 = service.signPayload('same', 'secret2');
      expect(sig1).not.toBe(sig2);
    });
  });
});
