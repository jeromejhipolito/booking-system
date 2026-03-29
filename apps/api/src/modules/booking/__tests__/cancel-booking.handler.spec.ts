import { CancelBookingHandler } from '../commands/cancel-booking.handler';
import { CancelBookingCommand } from '../commands/cancel-booking.command';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('CancelBookingHandler', () => {
  let handler: CancelBookingHandler;
  let bookingRepo: any;
  let tokenService: any;
  let eventBus: any;

  const mockBooking = {
    id: 'booking-1',
    status: 'confirmed',
    providerId: 'prov-1',
    customerId: 'cust-1',
    customer: { id: 'cust-1', email: 'test@example.com', userId: 'user-cust' },
    provider: { id: 'prov-1', userId: 'user-prov' },
  };

  beforeEach(() => {
    bookingRepo = {
      findOne: jest.fn().mockResolvedValue({ ...mockBooking }),
      save: jest.fn((entity) => Promise.resolve(entity)),
    };
    tokenService = { validateToken: jest.fn() };
    eventBus = { publish: jest.fn() };

    handler = new CancelBookingHandler(bookingRepo, tokenService, eventBus);
  });

  it('throws NotFoundException when booking not found', async () => {
    bookingRepo.findOne.mockResolvedValue(null);
    const cmd = new CancelBookingCommand('nonexistent', 'reason', undefined, undefined);
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when already cancelled', async () => {
    bookingRepo.findOne.mockResolvedValue({ ...mockBooking, status: 'cancelled' });
    const cmd = new CancelBookingCommand('booking-1', 'reason', undefined, 'token');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when completed', async () => {
    bookingRepo.findOne.mockResolvedValue({ ...mockBooking, status: 'completed' });
    const cmd = new CancelBookingCommand('booking-1', 'reason', undefined, 'token');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('allows cancel with valid access token', async () => {
    tokenService.validateToken.mockReturnValue(true);
    const cmd = new CancelBookingCommand('booking-1', 'Schedule conflict', undefined, 'valid-token');
    const result = await handler.execute(cmd);

    expect(result.status).toBe('cancelled');
    expect(tokenService.validateToken).toHaveBeenCalledWith('valid-token', 'booking-1', 'test@example.com');
  });

  it('throws ForbiddenException with invalid access token', async () => {
    tokenService.validateToken.mockReturnValue(false);
    const cmd = new CancelBookingCommand('booking-1', 'reason', undefined, 'bad-token');
    await expect(handler.execute(cmd)).rejects.toThrow(ForbiddenException);
  });

  it('allows cancel when userId matches customer.userId', async () => {
    const cmd = new CancelBookingCommand('booking-1', 'reason', 'user-cust', undefined);
    const result = await handler.execute(cmd);
    expect(result.status).toBe('cancelled');
  });

  it('allows cancel when userId matches provider.userId', async () => {
    const cmd = new CancelBookingCommand('booking-1', 'reason', 'user-prov', undefined);
    const result = await handler.execute(cmd);
    expect(result.status).toBe('cancelled');
  });

  it('throws ForbiddenException when no auth matches', async () => {
    const cmd = new CancelBookingCommand('booking-1', 'reason', 'random-user', undefined);
    await expect(handler.execute(cmd)).rejects.toThrow(ForbiddenException);
  });

  it('sets status to cancelled and saves reason', async () => {
    tokenService.validateToken.mockReturnValue(true);
    const cmd = new CancelBookingCommand('booking-1', 'Personal emergency', undefined, 'valid-token');
    const result = await handler.execute(cmd);

    expect(result.status).toBe('cancelled');
    expect(result.cancellationReason).toBe('Personal emergency');
    expect(bookingRepo.save).toHaveBeenCalled();
  });

  it('publishes BookingCancelledEvent with correct payload', async () => {
    tokenService.validateToken.mockReturnValue(true);
    const cmd = new CancelBookingCommand('booking-1', 'Test reason', undefined, 'valid-token');
    await handler.execute(cmd);

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const event = eventBus.publish.mock.calls[0][0];
    expect(event.bookingId).toBe('booking-1');
    expect(event.providerId).toBe('prov-1');
    expect(event.reason).toBe('Test reason');
  });
});
