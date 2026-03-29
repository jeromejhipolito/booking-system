import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetReviewsQueryDto } from '../dto/get-reviews-query.dto';

describe('GetReviewsQueryDto', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  it('accepts valid serviceId', async () => {
    const dto = plainToInstance(GetReviewsQueryDto, { serviceId: validUUID });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects missing serviceId', async () => {
    const dto = plainToInstance(GetReviewsQueryDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });

  it('rejects non-UUID serviceId', async () => {
    const dto = plainToInstance(GetReviewsQueryDto, { serviceId: 'abc' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });

  it('rejects limit over 100', async () => {
    const dto = plainToInstance(GetReviewsQueryDto, { serviceId: validUUID, limit: 999 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('rejects page less than 1', async () => {
    const dto = plainToInstance(GetReviewsQueryDto, { serviceId: validUUID, page: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });
});
