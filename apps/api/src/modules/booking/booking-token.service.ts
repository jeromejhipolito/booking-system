import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class BookingTokenService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret = this.configService.get('JWT_SECRET', 'super-secret-jwt-key-change-in-production');
  }

  /**
   * Generate an HMAC-SHA256 token for a booking.
   * This token can be used by customers to manage their booking without authentication.
   */
  generateToken(bookingId: string, customerEmail: string): string {
    const data = `${bookingId}:${customerEmail}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(data);
    return hmac.digest('hex');
  }

  /**
   * Validate an access token against a booking's id and customer email.
   */
  validateToken(
    token: string,
    bookingId: string,
    customerEmail: string,
  ): boolean {
    if (!token) return false;
    const expectedToken = this.generateToken(bookingId, customerEmail);
    try {
      const tokenBuf = Buffer.from(token, 'utf8');
      const expectedBuf = Buffer.from(expectedToken, 'utf8');
      if (tokenBuf.length !== expectedBuf.length) return false;
      return crypto.timingSafeEqual(tokenBuf, expectedBuf);
    } catch {
      return false;
    }
  }
}
