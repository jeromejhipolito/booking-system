import { BookingTokenService } from '../booking-token.service';
import { ConfigService } from '@nestjs/config';

describe('BookingTokenService', () => {
  let service: BookingTokenService;

  beforeEach(() => {
    const configService = { get: jest.fn().mockReturnValue('test-secret') } as any;
    service = new BookingTokenService(configService);
  });

  describe('generateToken', () => {
    it('returns consistent HMAC for same inputs', () => {
      const t1 = service.generateToken('booking-1', 'a@b.com');
      const t2 = service.generateToken('booking-1', 'a@b.com');
      expect(t1).toBe(t2);
    });

    it('returns different tokens for different booking IDs', () => {
      const t1 = service.generateToken('booking-1', 'a@b.com');
      const t2 = service.generateToken('booking-2', 'a@b.com');
      expect(t1).not.toBe(t2);
    });

    it('returns different tokens for different emails', () => {
      const t1 = service.generateToken('booking-1', 'a@b.com');
      const t2 = service.generateToken('booking-1', 'x@y.com');
      expect(t1).not.toBe(t2);
    });

    it('returns a 64-char hex string', () => {
      const token = service.generateToken('booking-1', 'a@b.com');
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('validateToken', () => {
    it('returns true for matching token', () => {
      const token = service.generateToken('booking-1', 'a@b.com');
      expect(service.validateToken(token, 'booking-1', 'a@b.com')).toBe(true);
    });

    it('returns false for wrong booking ID', () => {
      const token = service.generateToken('booking-1', 'a@b.com');
      expect(service.validateToken(token, 'booking-2', 'a@b.com')).toBe(false);
    });

    it('returns false for tampered token', () => {
      const token = service.generateToken('booking-1', 'a@b.com');
      const tampered = 'x' + token.slice(1);
      expect(service.validateToken(tampered, 'booking-1', 'a@b.com')).toBe(false);
    });

    it('returns false for wrong-length token (no RangeError)', () => {
      expect(service.validateToken('short', 'booking-1', 'a@b.com')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(service.validateToken('', 'booking-1', 'a@b.com')).toBe(false);
    });
  });
});
