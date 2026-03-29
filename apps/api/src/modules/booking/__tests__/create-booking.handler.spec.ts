import { CreateBookingHandler } from '../commands/create-booking.handler';
import { CreateBookingCommand } from '../commands/create-booking.command';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CreateBookingHandler', () => {
  let handler: CreateBookingHandler;
  let bookingRepo: any;
  let serviceRepo: any;
  let customerService: any;
  let tokenService: any;
  let eventBus: any;

  const mockService = {
    id: 'svc-1',
    providerId: 'prov-1',
    durationMinutes: 60,
    isActive: true,
    provider: { id: 'prov-1', settings: { autoConfirm: true }, userId: 'user-prov' },
  };

  const mockCustomer = { id: 'cust-1', email: 'test@example.com' };

  const baseCommand = new CreateBookingCommand(
    'svc-1',
    '2026-04-01T10:00:00.000Z',
    'test@example.com',
    'John',
    'Doe',
    '+639171234567',
    '',
    undefined,
    undefined,
  );

  beforeEach(() => {
    bookingRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => ({ ...data, id: 'booking-1' })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'booking-1' })),
    };
    serviceRepo = { findOne: jest.fn().mockResolvedValue(mockService) };
    customerService = { findOrCreateByEmail: jest.fn().mockResolvedValue(mockCustomer) };
    tokenService = { generateToken: jest.fn().mockReturnValue('mock-token-abc') };
    eventBus = { publish: jest.fn() };

    handler = new CreateBookingHandler(bookingRepo, serviceRepo, customerService, tokenService, eventBus);
  });

  it('returns existing booking when idempotencyKey matches', async () => {
    const existing = { id: 'existing-booking', idempotencyKey: 'key-1' };
    bookingRepo.findOne.mockResolvedValueOnce(existing);
    const cmd = new CreateBookingCommand('svc-1', '2026-04-01T10:00:00Z', 'a@b.com', 'A', 'B', '', '', 'key-1', undefined);

    const result = await handler.execute(cmd);

    expect(result).toBe(existing);
    expect(bookingRepo.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when service not found', async () => {
    serviceRepo.findOne.mockResolvedValue(null);
    await expect(handler.execute(baseCommand)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when service inactive', async () => {
    serviceRepo.findOne.mockResolvedValue({ ...mockService, isActive: false });
    await expect(handler.execute(baseCommand)).rejects.toThrow(BadRequestException);
  });

  it('calls customerService.findOrCreateByEmail with correct args', async () => {
    bookingRepo.findOne.mockResolvedValue({ id: 'booking-1', service: mockService, provider: mockService.provider, customer: mockCustomer });
    await handler.execute(baseCommand);

    expect(customerService.findOrCreateByEmail).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+639171234567',
      userId: undefined,
    });
  });

  it('calculates endTime correctly from durationMinutes', async () => {
    bookingRepo.findOne.mockResolvedValue({ id: 'booking-1', service: mockService, provider: mockService.provider, customer: mockCustomer });
    await handler.execute(baseCommand);

    const createCall = bookingRepo.create.mock.calls[0][0];
    const start = new Date('2026-04-01T10:00:00.000Z');
    const expectedEnd = new Date(start.getTime() + 60 * 60 * 1000);
    expect(createCall.endTime.getTime()).toBe(expectedEnd.getTime());
  });

  it('sets status to confirmed when autoConfirm is true', async () => {
    bookingRepo.findOne.mockResolvedValue({ id: 'booking-1', service: mockService, provider: mockService.provider, customer: mockCustomer });
    await handler.execute(baseCommand);

    const createCall = bookingRepo.create.mock.calls[0][0];
    expect(createCall.status).toBe('confirmed');
  });

  it('sets status to pending when autoConfirm is false', async () => {
    serviceRepo.findOne.mockResolvedValue({
      ...mockService,
      provider: { ...mockService.provider, settings: { autoConfirm: false } },
    });
    bookingRepo.findOne.mockResolvedValue({ id: 'booking-1', service: mockService, provider: mockService.provider, customer: mockCustomer });
    await handler.execute(baseCommand);

    const createCall = bookingRepo.create.mock.calls[0][0];
    expect(createCall.status).toBe('pending');
  });

  it('throws ConflictException on PostgreSQL exclusion violation (23P01)', async () => {
    bookingRepo.save.mockRejectedValueOnce({ code: '23P01' });
    await expect(handler.execute(baseCommand)).rejects.toThrow(ConflictException);
  });

  it('re-throws non-exclusion database errors', async () => {
    const dbError = new Error('Unique violation');
    (dbError as any).code = '23505';
    bookingRepo.save.mockRejectedValueOnce(dbError);
    await expect(handler.execute(baseCommand)).rejects.toThrow('Unique violation');
  });

  it('generates and saves access token after initial save', async () => {
    bookingRepo.findOne.mockResolvedValue({ id: 'booking-1', service: mockService, provider: mockService.provider, customer: mockCustomer });
    await handler.execute(baseCommand);

    expect(tokenService.generateToken).toHaveBeenCalledWith('booking-1', 'test@example.com');
    // Second save includes the token
    expect(bookingRepo.save).toHaveBeenCalledTimes(2);
    const secondSave = bookingRepo.save.mock.calls[1][0];
    expect(secondSave.accessToken).toBe('mock-token-abc');
  });

  it('publishes BookingConfirmedEvent', async () => {
    bookingRepo.findOne.mockResolvedValue({ id: 'booking-1', service: mockService, provider: mockService.provider, customer: mockCustomer });
    await handler.execute(baseCommand);

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const event = eventBus.publish.mock.calls[0][0];
    expect(event.bookingId).toBe('booking-1');
    expect(event.customerEmail).toBe('test@example.com');
    expect(event.accessToken).toBe('mock-token-abc');
  });
});
