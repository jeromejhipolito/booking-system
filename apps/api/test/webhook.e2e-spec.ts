import * as request from 'supertest';
import { createHmac } from 'crypto';

const API_URL = 'http://localhost:3001';

describe('Webhooks (e2e)', () => {
  describe('Inbound webhook ingestion', () => {
    const secret = 'default-webhook-secret'; // Matches ConfigService default

    it('should accept webhook with valid HMAC signature (202)', async () => {
      const payload = JSON.stringify({
        id: `evt-${Date.now()}`,
        event_type: 'booking.synced',
        data: { bookingId: '12345', status: 'confirmed' },
      });

      const signature = createHmac('sha256', secret).update(payload).digest('hex');

      const res = await request(API_URL)
        .post('/v1/webhooks/ingest/calendar-sync')
        .set('Content-Type', 'application/json')
        .set('X-Webhook-Signature', signature)
        .send(payload)
        .expect(202);

      expect(res.body).toHaveProperty('status', 'accepted');
      expect(res.body).toHaveProperty('id');
    });

    it('should reject webhook with invalid signature (401)', async () => {
      const payload = JSON.stringify({
        id: `evt-bad-${Date.now()}`,
        event_type: 'booking.synced',
        data: { bookingId: '99999' },
      });

      await request(API_URL)
        .post('/v1/webhooks/ingest/calendar-sync')
        .set('Content-Type', 'application/json')
        .set('X-Webhook-Signature', 'invalid-signature-here')
        .send(payload)
        .expect(401);
    });

    it('should handle duplicate events idempotently (200)', async () => {
      const eventId = `evt-dup-${Date.now()}`;
      const payload = JSON.stringify({
        id: eventId,
        event_type: 'booking.updated',
        data: { bookingId: '11111' },
      });

      const signature = createHmac('sha256', secret).update(payload).digest('hex');

      // First request
      await request(API_URL)
        .post('/v1/webhooks/ingest/calendar-sync')
        .set('Content-Type', 'application/json')
        .set('X-Webhook-Signature', signature)
        .send(payload)
        .expect(202);

      // Duplicate request with same event ID
      const res = await request(API_URL)
        .post('/v1/webhooks/ingest/calendar-sync')
        .set('Content-Type', 'application/json')
        .set('X-Webhook-Signature', signature)
        .send(payload)
        .expect(200);

      expect(res.body).toHaveProperty('status', 'already_processed');
    });
  });

  describe('HMAC token service (booking access tokens)', () => {
    it('should generate valid access tokens for bookings', async () => {
      // Register + create provider + service + booking
      const email = `hmac-test-${Date.now()}@example.com`;
      let reg = await request(API_URL)
        .post('/v1/auth/register')
        .send({ email, password: 'HmacTest123!', firstName: 'HMAC', lastName: 'Test', role: 'provider' });

      if (reg.status === 409) {
        reg = await request(API_URL)
          .post('/v1/auth/login')
          .send({ email, password: 'HmacTest123!' });
      }

      const token = reg.body.accessToken;

      const prov = await request(API_URL)
        .post('/v1/providers')
        .set('Authorization', `Bearer ${token}`)
        .send({ businessName: 'HMAC Test Biz', timezone: 'UTC' });

      const svc = await request(API_URL)
        .post('/v1/services')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'HMAC Service', providerId: prov.body.id, serviceType: 'appointment', durationMinutes: 30, price: 50, currency: 'PHP' });

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);
      futureDate.setHours(11, 0, 0, 0);

      const booking = await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId: svc.body.id,
          startTime: futureDate.toISOString(),
          customerEmail: 'hmac-customer@example.com',
          customerFirstName: 'HMAC',
          customerLastName: 'Customer',
        })
        .expect(201);

      expect(booking.body.accessToken).toBeDefined();
      expect(booking.body.accessToken.length).toBeGreaterThan(10);

      // Cancel with valid token should succeed
      await request(API_URL)
        .patch(`/v1/bookings/${booking.body.id}/cancel`)
        .send({ token: booking.body.accessToken, reason: 'HMAC test' })
        .expect(200);

      // Cancel with wrong token should fail
      await request(API_URL)
        .patch(`/v1/bookings/${booking.body.id}/cancel`)
        .send({ token: 'wrong-token-here', reason: 'Should fail' })
        .expect(403);
    });
  });
});
