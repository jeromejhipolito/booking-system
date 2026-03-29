import * as request from 'supertest';

const API_URL = 'http://localhost:3001';

describe('Booking Reliability (e2e)', () => {
  let providerAccessToken: string;
  let providerId: string;
  let serviceId: string;
  const providerEmail = `rel-prov-${Date.now()}@example.com`;
  const providerPassword = 'RelPass123!';

  beforeAll(async () => {
    // Register provider
    const registerRes = await request(API_URL)
      .post('/v1/auth/register')
      .send({
        email: providerEmail,
        password: providerPassword,
        firstName: 'Reliability',
        lastName: 'Provider',
        role: 'provider',
      });
    providerAccessToken = registerRes.body.accessToken;

    // Create provider profile
    const providerRes = await request(API_URL)
      .post('/v1/providers')
      .set('Authorization', `Bearer ${providerAccessToken}`)
      .send({
        businessName: 'Reliability Test Biz',
        timezone: 'UTC',
      });
    providerId = providerRes.body.id;

    // Create service
    const serviceRes = await request(API_URL)
      .post('/v1/services')
      .set('Authorization', `Bearer ${providerAccessToken}`)
      .send({
        name: 'Reliability Test Service',
        providerId,
        serviceType: 'appointment',
        durationMinutes: 60,
        price: 100,
        currency: 'PHP',
      });
    serviceId = serviceRes.body.id;
  });

  describe('Idempotency', () => {
    it('should return the same booking when using the same idempotency key', async () => {
      const key = `idem-rel-${Date.now()}`;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      futureDate.setHours(9, 0, 0, 0);

      // First request
      const res1 = await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId,
          startTime: futureDate.toISOString(),
          customerEmail: 'idem-test@example.com',
          customerFirstName: 'Idem',
          customerLastName: 'Test',
          idempotencyKey: key,
        })
        .expect(201);

      // Second request with same key
      const res2 = await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId,
          startTime: futureDate.toISOString(),
          customerEmail: 'idem-test@example.com',
          customerFirstName: 'Idem',
          customerLastName: 'Test',
          idempotencyKey: key,
        })
        .expect(201);

      // Both should return the same booking ID
      expect(res1.body.id).toBe(res2.body.id);
    });
  });

  describe('Double-booking prevention (EXCLUSION constraint)', () => {
    it('should reject overlapping bookings for the same provider', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 11);
      futureDate.setHours(14, 0, 0, 0);

      // First booking: 14:00-15:00
      await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId,
          startTime: futureDate.toISOString(),
          customerEmail: 'slot-a@example.com',
          customerFirstName: 'Slot',
          customerLastName: 'A',
        })
        .expect(201);

      // Overlapping booking: 14:30-15:30
      const overlapDate = new Date(futureDate);
      overlapDate.setMinutes(30);

      const res = await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId,
          startTime: overlapDate.toISOString(),
          customerEmail: 'slot-b@example.com',
          customerFirstName: 'Slot',
          customerLastName: 'B',
        })
        .expect(409);

      expect(res.body.message).toMatch(/already booked|conflict|time slot/i);
    });
  });

  describe('Cancellation frees the slot', () => {
    it('should allow rebooking a cancelled slot', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 12);
      futureDate.setHours(10, 0, 0, 0);

      // Book the slot
      const booking = await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId,
          startTime: futureDate.toISOString(),
          customerEmail: 'cancel-test@example.com',
          customerFirstName: 'Cancel',
          customerLastName: 'Test',
        })
        .expect(201);

      // Cancel it
      await request(API_URL)
        .patch(`/v1/bookings/${booking.body.id}/cancel`)
        .send({ reason: 'Testing', token: booking.body.accessToken })
        .expect(200);

      // Rebook the same slot — should succeed because EXCLUSION excludes cancelled
      await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId,
          startTime: futureDate.toISOString(),
          customerEmail: 'rebook-test@example.com',
          customerFirstName: 'Rebook',
          customerLastName: 'Test',
        })
        .expect(201);
    });
  });

  describe('Concurrent booking race condition', () => {
    it('should allow exactly one booking when 5 simultaneous requests target the same slot', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 13);
      futureDate.setHours(16, 0, 0, 0);

      // Fire 5 simultaneous requests
      const results = await Promise.allSettled(
        Array.from({ length: 5 }).map((_, i) =>
          request(API_URL)
            .post('/v1/bookings')
            .send({
              serviceId,
              startTime: futureDate.toISOString(),
              customerEmail: `race-${i}@example.com`,
              customerFirstName: `Racer${i}`,
              customerLastName: 'Test',
            }),
        ),
      );

      const successes = results.filter(
        (r) => r.status === 'fulfilled' && r.value.status === 201,
      );
      const conflicts = results.filter(
        (r) => r.status === 'fulfilled' && r.value.status === 409,
      );

      // Exactly 1 should win, rest should get 409
      expect(successes.length).toBe(1);
      expect(conflicts.length).toBe(4);
    });
  });
});
