import * as request from 'supertest';

const API_URL = 'http://localhost:3001';

describe('Services (e2e)', () => {
  let providerAccessToken: string;
  let providerId: string;
  const providerEmail = `provider-${Date.now()}@example.com`;
  const providerPassword = 'ProviderPass123!';

  beforeAll(async () => {
    // Register a provider user (or login if already exists)
    let registerRes = await request(API_URL)
      .post('/v1/auth/register')
      .send({
        email: providerEmail,
        password: providerPassword,
        firstName: 'Service',
        lastName: 'Provider',
        role: 'provider',
      });

    if (registerRes.status === 409) {
      registerRes = await request(API_URL)
        .post('/v1/auth/login')
        .send({ email: providerEmail, password: providerPassword });
    }

    providerAccessToken = registerRes.body.accessToken;

    if (!providerAccessToken) {
      throw new Error(`Auth failed: status=${registerRes.status} body=${JSON.stringify(registerRes.body)}`);
    }

    // Create a provider profile
    const providerRes = await request(API_URL)
      .post('/v1/providers')
      .set('Authorization', `Bearer ${providerAccessToken}`)
      .send({
        businessName: 'Test Business',
        description: 'A test business for e2e tests',
        timezone: 'UTC',
      });

    providerId = providerRes.body.id;
  });

  describe('GET /v1/services', () => {
    it('should return 200 with paginated data (public, no auth needed)', async () => {
      const res = await request(API_URL)
        .get('/v1/services')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('totalPages');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /v1/services', () => {
    it('should return 401 without auth', async () => {
      await request(API_URL)
        .post('/v1/services')
        .send({
          name: 'Unauthorized Service',
          providerId: providerId,
        })
        .expect(401);
    });

    it('should return 201 when created with provider auth', async () => {
      const res = await request(API_URL)
        .post('/v1/services')
        .set('Authorization', `Bearer ${providerAccessToken}`)
        .send({
          name: 'E2E Test Service',
          description: 'A service created by e2e tests',
          providerId: providerId,
          serviceType: 'appointment',
          durationMinutes: 30,
          price: 50,
          currency: 'USD',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'E2E Test Service');
      expect(res.body).toHaveProperty('providerId', providerId);
      expect(res.body).toHaveProperty('durationMinutes', 30);
      expect(res.body).toHaveProperty('isActive', true);
    });
  });
});
