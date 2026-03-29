import { NotificationService } from '../notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let outboxRepo: any;
  let queue: any;
  let emailService: any;
  let smsService: any;
  let calendarService: any;

  beforeEach(() => {
    outboxRepo = {
      create: jest.fn((data) => ({ ...data, id: 'outbox-1' })),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    queue = { add: jest.fn().mockResolvedValue({}) };
    emailService = {
      sendBookingConfirmation: jest.fn().mockResolvedValue(undefined),
      sendBookingCancellation: jest.fn().mockResolvedValue(undefined),
      sendBookingReschedule: jest.fn().mockResolvedValue(undefined),
      sendBookingReminder: jest.fn().mockResolvedValue(undefined),
    };
    smsService = { sendBookingReminder: jest.fn().mockResolvedValue(undefined) };
    calendarService = { generateICalEvent: jest.fn().mockResolvedValue(undefined) };

    service = new NotificationService(outboxRepo, queue, emailService, smsService, calendarService);
  });

  describe('queueEvent', () => {
    it('saves to outbox and dispatches to BullMQ', async () => {
      await service.queueEvent('booking.confirmed', { bookingId: '1' });

      expect(outboxRepo.create).toHaveBeenCalledWith({ eventType: 'booking.confirmed', payload: { bookingId: '1' } });
      expect(outboxRepo.save).toHaveBeenCalled();
      expect(queue.add).toHaveBeenCalledWith('process-event', expect.objectContaining({ eventType: 'booking.confirmed', outboxId: 'outbox-1' }), expect.any(Object));
    });

    it('still saves outbox when BullMQ dispatch fails', async () => {
      queue.add.mockRejectedValue(new Error('Redis down'));
      const result = await service.queueEvent('booking.confirmed', { bookingId: '1' });

      expect(outboxRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('processEvent', () => {
    const makeEvent = (eventType: string) => ({
      id: 'evt-1',
      eventType,
      payload: { bookingId: '1' },
      processed: false,
      retryCount: 0,
      processedAt: null,
      error: null,
    });

    it('routes booking.confirmed to email + calendar', async () => {
      await service.processEvent(makeEvent('booking.confirmed') as any);
      expect(emailService.sendBookingConfirmation).toHaveBeenCalled();
      expect(calendarService.generateICalEvent).toHaveBeenCalled();
      expect(smsService.sendBookingReminder).not.toHaveBeenCalled();
    });

    it('routes booking.cancelled to email only', async () => {
      await service.processEvent(makeEvent('booking.cancelled') as any);
      expect(emailService.sendBookingCancellation).toHaveBeenCalled();
      expect(calendarService.generateICalEvent).not.toHaveBeenCalled();
    });

    it('routes booking.rescheduled to email + calendar', async () => {
      await service.processEvent(makeEvent('booking.rescheduled') as any);
      expect(emailService.sendBookingReschedule).toHaveBeenCalled();
      expect(calendarService.generateICalEvent).toHaveBeenCalled();
    });

    it('routes booking.reminder to email + SMS', async () => {
      await service.processEvent(makeEvent('booking.reminder') as any);
      expect(emailService.sendBookingReminder).toHaveBeenCalled();
      expect(smsService.sendBookingReminder).toHaveBeenCalled();
    });

    it('marks event as processed on success', async () => {
      const event = makeEvent('booking.confirmed') as any;
      await service.processEvent(event);
      expect(event.processed).toBe(true);
      expect(event.processedAt).toBeInstanceOf(Date);
    });

    it('increments retryCount on failure', async () => {
      emailService.sendBookingConfirmation.mockRejectedValue(new Error('SMTP error'));
      const event = makeEvent('booking.confirmed') as any;
      await service.processEvent(event);
      expect(event.retryCount).toBe(1);
      expect(event.error).toBe('SMTP error');
    });

    it('marks processed=true after 5 retries (gives up)', async () => {
      emailService.sendBookingConfirmation.mockRejectedValue(new Error('Permanent failure'));
      const event = makeEvent('booking.confirmed') as any;
      event.retryCount = 4;
      await service.processEvent(event);
      expect(event.retryCount).toBe(5);
      expect(event.processed).toBe(true);
    });

    it('does not mark processed on failure below 5 retries', async () => {
      emailService.sendBookingConfirmation.mockRejectedValue(new Error('Transient'));
      const event = makeEvent('booking.confirmed') as any;
      event.retryCount = 2;
      await service.processEvent(event);
      expect(event.retryCount).toBe(3);
      expect(event.processed).toBe(false);
    });
  });
});
