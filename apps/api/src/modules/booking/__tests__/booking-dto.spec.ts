import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateBookingDto, ListBookingsQueryDto } from '../booking.controller';

describe('CreateBookingDto', () => {
  const validData = {
    serviceId: '550e8400-e29b-41d4-a716-446655440000',
    startTime: '2026-04-01T10:00:00.000Z',
    customerEmail: 'test@example.com',
    customerFirstName: 'John',
    customerLastName: 'Doe',
  };

  it('accepts valid minimal payload', async () => {
    const dto = plainToInstance(CreateBookingDto, validData);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts valid full payload with optionals', async () => {
    const dto = plainToInstance(CreateBookingDto, {
      ...validData,
      customerPhone: '+63917123',
      notes: 'Test note',
      idempotencyKey: 'key-123',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects missing serviceId', async () => {
    const { serviceId, ...rest } = validData;
    const dto = plainToInstance(CreateBookingDto, rest);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });

  it('rejects non-UUID serviceId', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, serviceId: 'not-a-uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });

  it('rejects missing startTime', async () => {
    const { startTime, ...rest } = validData;
    const dto = plainToInstance(CreateBookingDto, rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'startTime')).toBe(true);
  });

  it('rejects non-ISO startTime', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, startTime: 'next Tuesday' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'startTime')).toBe(true);
  });

  it('rejects invalid email', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, customerEmail: 'notanemail' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerEmail')).toBe(true);
  });

  it('rejects empty customerFirstName', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, customerFirstName: '' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerFirstName')).toBe(true);
  });

  it('rejects customerFirstName over 100 chars', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, customerFirstName: 'A'.repeat(101) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerFirstName')).toBe(true);
  });

  it('rejects notes over 1000 chars', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, notes: 'X'.repeat(1001) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'notes')).toBe(true);
  });

  it('rejects idempotencyKey over 255 chars', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, idempotencyKey: 'K'.repeat(256) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'idempotencyKey')).toBe(true);
  });

  it('rejects phone over 20 chars', async () => {
    const dto = plainToInstance(CreateBookingDto, { ...validData, customerPhone: '1'.repeat(21) });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerPhone')).toBe(true);
  });
});

describe('ListBookingsQueryDto', () => {
  it('accepts empty query (all optional)', async () => {
    const dto = plainToInstance(ListBookingsQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts valid status enum value', async () => {
    const dto = plainToInstance(ListBookingsQueryDto, { status: 'confirmed' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects invalid status string', async () => {
    const dto = plainToInstance(ListBookingsQueryDto, { status: 'hacked' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('rejects non-UUID providerId', async () => {
    const dto = plainToInstance(ListBookingsQueryDto, { providerId: 'abc' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'providerId')).toBe(true);
  });
});
