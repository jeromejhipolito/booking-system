import { OutboxProcessorService } from '../outbox-processor.service';

describe('OutboxProcessorService', () => {
  let service: OutboxProcessorService;
  let mockQueryRunner: any;
  let dataSource: any;
  let notificationService: any;

  beforeEach(() => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      query: jest.fn().mockResolvedValue([]),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };
    dataSource = { createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner) };
    notificationService = { processEvent: jest.fn().mockResolvedValue(undefined) };

    service = new OutboxProcessorService(dataSource, notificationService);
  });

  it('skips processing when already running (reentrant guard)', async () => {
    // Set processing flag via direct property access
    (service as any).processing = true;
    await service.processOutbox();
    expect(dataSource.createQueryRunner).not.toHaveBeenCalled();
  });

  it('executes SELECT FOR UPDATE SKIP LOCKED query', async () => {
    await service.processOutbox();
    const sql = mockQueryRunner.query.mock.calls[0][0];
    expect(sql).toContain('FOR UPDATE SKIP LOCKED');
  });

  it('maps snake_case DB columns to camelCase entity', async () => {
    mockQueryRunner.query.mockResolvedValue([
      { id: 'evt-1', event_type: 'booking.confirmed', payload: { a: 1 }, processed: false, processed_at: null, error: null, retry_count: 2, created_at: '2026-01-01' },
    ]);

    await service.processOutbox();

    const event = notificationService.processEvent.mock.calls[0][0];
    expect(event.eventType).toBe('booking.confirmed');
    expect(event.retryCount).toBe(2);
  });

  it('calls notificationService.processEvent for each row', async () => {
    mockQueryRunner.query.mockResolvedValue([
      { id: 'evt-1', event_type: 'a', payload: {}, processed: false, processed_at: null, error: null, retry_count: 0, created_at: '' },
      { id: 'evt-2', event_type: 'b', payload: {}, processed: false, processed_at: null, error: null, retry_count: 0, created_at: '' },
    ]);

    await service.processOutbox();
    expect(notificationService.processEvent).toHaveBeenCalledTimes(2);
  });

  it('commits transaction on success', async () => {
    await service.processOutbox();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('rolls back transaction on error', async () => {
    mockQueryRunner.query.mockResolvedValue([
      { id: 'evt-1', event_type: 'a', payload: {}, processed: false, processed_at: null, error: null, retry_count: 0, created_at: '' },
    ]);
    notificationService.processEvent.mockRejectedValue(new Error('fail'));

    await service.processOutbox();
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('releases queryRunner in finally block', async () => {
    await service.processOutbox();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});
