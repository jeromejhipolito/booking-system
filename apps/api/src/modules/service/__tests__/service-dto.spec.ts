import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateServiceDto } from '../service.controller';

describe('CreateServiceDto', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  const validData = {
    name: 'Test Service',
    providerId: validUUID,
    serviceType: 'appointment',
    durationMinutes: 60,
    price: 1500,
    currency: 'PHP',
  };

  it('accepts valid service payload', async () => {
    const dto = plainToInstance(CreateServiceDto, validData);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-UUID providerId', async () => {
    const dto = plainToInstance(CreateServiceDto, { ...validData, providerId: 'abc' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'providerId')).toBe(true);
  });

  it('rejects invalid currency (not 3-letter uppercase)', async () => {
    const dto = plainToInstance(CreateServiceDto, { ...validData, currency: 'BITCOIN' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'currency')).toBe(true);
  });

  it('rejects duration less than 5', async () => {
    const dto = plainToInstance(CreateServiceDto, { ...validData, durationMinutes: 2 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'durationMinutes')).toBe(true);
  });

  it('rejects duration greater than 480', async () => {
    const dto = plainToInstance(CreateServiceDto, { ...validData, durationMinutes: 999 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'durationMinutes')).toBe(true);
  });
});
