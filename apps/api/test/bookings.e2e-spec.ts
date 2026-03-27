import * as request from 'supertest';

const API_URL = 'http://localhost:3001';

describe('Bookings (e2e)', () => {
  let providerAccessToken: string;
  let providerId: string;
  let serviceId: string;
  let bookingId: string;
  let bookingAccessToken: string;
  const idempotencyKey = `idem-${Date.now()}`;
  const providerEmail = `booking-prov-${Date.now()}@example.com`;
  const providerPassword = 'ProviderPass123!';
  const customerEmail = `booking-cust-${Date.now()}@example.com`;

  beforeAll(async () => {
    // Register a provider user
    const registerRes = await request(API_URL)
      .post('/v1/auth/register')
      .send({
        email: providerEmail,
        password: providerPassword,
        firstName: 'Booking',
        lastName: 'Provider',
        role: 'provider',
      });

    providerAccessToken = registerRes.body.accessToken;

    // Create provider profile
    const providerRes = await request(API_URL)
      .post('/v1/providers')
      .set('Authorization', `Bearer ${providerAccessToken}`)
      .send({
        businessName: 'Booking Test Biz',
        description: 'Business for booking e2e tests',
        timezone: 'UTC',
      });

    providerId = providerRes.body.id;

    // Create a service
    const serviceRes = await request(API_URL)
      .post('/v1/services')
      .set('Authorization', `Bearer ${providerAccessToken}`)
      .send({
        name: 'Booking Test Service',
        description: 'For booking tests',
        providerId: providerId,
        serviceType: 'appointment',
        durationMinutes: 30,
        price: 40,
        currency: 'USD',
      });

    serviceId = serviceRes.body.id;
  });

  describe('POST /v1/bookings', () => {
    it('should return 201 for guest checkout (no auth needed)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      futureDate.setHours(10, 0, 0, 0);

      const res = await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId: serviceId,
          startTime: futureDate.toISOString(),
          customerEmail: customerEmail,
          customerFirstName: 'Guest',
          customerLastName: 'Customer',
          customerPhone: '+1234567890',
          notes: 'E2E test booking',
          idempotencyKey: idempotencyKey,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('serviceId', serviceId);
      expect(res.body).toHaveProperty('providerId', providerId);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('accessToken');
      expect(['confirmed', 'pending']).toContain(res.body.status);

      bookingId = res.body.id;
      bookingAccessToken = res.body.accessToken;
    });

    it('should return the same booking with the same idempotency key', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      futureDate.setHours(10, 0, 0, 0);

      const res = await request(API_URL)
        .post('/v1/bookings')
        .send({
          serviceId: serviceId,
          startTime: futureDate.toISOString(),
          customerEmail: customerEmail,
          customerFirstName: 'Guest',
          customerLastName: 'Customer',
          idempotencyKey: idempotencyKey,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id', bookingId);
    });
  });

  describe('PATCH /v1/bookings/:id/cancel', () => {
    it('should return 403 without auth or token', async () => {
      await request(API_URL)
        .patch(`/v1/bookings/${bookingId}/cancel`)
        .send({ reason: 'Testing unauthorized cancel' })
        .expect(403);
    });

    it('should return 200 when cancelling with valid booking access token', async () => {
      const res = await request(API_URL)
        .patch(`/v1/bookings/${bookingId}/cancel`)
        .send({
          reason: 'E2E test cancellation',
          token: bookingAccessToken,
        })
        .expect(200);

      expect(res.body).toHaveProperty('id', bookingId);
      expect(res.body).toHaveProperty('status', 'cancelled');
      expect(res.body).toHaveProperty('cancellationReason', 'E2E test cancellation');
    });
  });
});
