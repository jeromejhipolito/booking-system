import * as request from 'supertest';

const API_URL = 'http://localhost:3001';

describe('Auth (e2e)', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  let accessToken: string;

  describe('POST /v1/auth/register', () => {
    it('should register a new user and return 201 with accessToken + user', async () => {
      const res = await request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testEmail);
      expect(res.body.user).toHaveProperty('firstName', 'Test');
      expect(res.body.user).toHaveProperty('lastName', 'User');
      expect(res.body.user).not.toHaveProperty('passwordHash');

      accessToken = res.body.accessToken;
    });

    it('should return 409 when registering with duplicate email', async () => {
      const res = await request(API_URL)
        .post('/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'Duplicate',
        })
        .expect(409);

      expect(res.body).toHaveProperty('message', 'Email already registered');
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should login with valid credentials and return 200 with accessToken', async () => {
      const res = await request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', testEmail);

      // Update token for later tests
      accessToken = res.body.accessToken;
    });

    it('should return 401 with wrong password', async () => {
      const res = await request(API_URL)
        .post('/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /v1/users/me', () => {
    it('should return 401 without token', async () => {
      await request(API_URL)
        .get('/v1/users/me')
        .expect(401);
    });

    it('should return 200 with user data when using valid token', async () => {
      const res = await request(API_URL)
        .get('/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', testEmail);
      expect(res.body).toHaveProperty('firstName', 'Test');
      expect(res.body).toHaveProperty('lastName', 'User');
      expect(res.body).not.toHaveProperty('passwordHash');
    });
  });
});
