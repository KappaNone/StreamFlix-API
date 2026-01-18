import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { PrismaClient, QualityName, TitleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ensureE2EEnv } from './e2e-env';
import { XmlInterceptor } from '../src/common/xml.interceptor';
import * as xmlparser from 'express-xml-bodyparser';

describe('HTTP Endpoints (e2e)', () => {
  jest.setTimeout(60_000);

  let app: INestApplication;
  let prisma: PrismaClient;

  const testUserEmail = 'e2e.user@streamflix.local';
  const testUserPassword = 'Password123!';
  let testUserId: number;
  const inviteeEmail = 'e2e.invitee@streamflix.local';
  const inviteePassword = 'Password123!';
  let inviteeUserId: number;
  let accessToken: string | undefined;

  const getAccessToken = async () => {
    if (accessToken) {
      return accessToken;
    }

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUserEmail, password: testUserPassword });

    expect([200, 201]).toContain(loginRes.status);
    expect(loginRes.body).toHaveProperty('accessToken');
    expect(typeof loginRes.body.accessToken).toBe('string');

    accessToken = loginRes.body.accessToken;
    return accessToken;
  };

  beforeAll(async () => {
    ensureE2EEnv();

    prisma = new PrismaClient();
    await prisma.$connect();

    // Clean up only data related to this e2e user (avoid wiping shared/dev seed data).
    const existingUser = await prisma.user.findUnique({
      where: { email: testUserEmail },
      select: { id: true },
    });

    if (existingUser) {
      await prisma.invitation.deleteMany({
        where: {
          OR: [
            { inviterId: existingUser.id },
            { inviteeEmail: testUserEmail },
          ],
        },
      });
      await prisma.subscription.deleteMany({ where: { userId: existingUser.id } });
      await prisma.profile.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    await prisma.title.deleteMany({ where: { name: { startsWith: 'E2E Title' } } });

    const hashedPassword = await bcrypt.hash(testUserPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: hashedPassword,
        name: 'E2E User',
        emailVerified: true,
        isActive: true,
      },
    });
    testUserId = user.id;

    const inviteeExisting = await prisma.user.findUnique({
      where: { email: inviteeEmail },
      select: { id: true },
    });

    if (inviteeExisting) {
      await prisma.invitation.deleteMany({
        where: { OR: [{ inviterId: inviteeExisting.id }, { inviteeEmail }] },
      });
      await prisma.subscription.deleteMany({ where: { userId: inviteeExisting.id } });
      await prisma.profile.deleteMany({ where: { userId: inviteeExisting.id } });
      await prisma.user.delete({ where: { id: inviteeExisting.id } });
    }

    const inviteeHashed = await bcrypt.hash(inviteePassword, 10);
    const invitee = await prisma.user.create({
      data: {
        email: inviteeEmail,
        password: inviteeHashed,
        name: 'E2E Invitee',
        emailVerified: true,
        isActive: true,
      },
    });
    inviteeUserId = invitee.id;

    // Ensure at least one plan exists for subscription endpoint tests.
    await prisma.subscriptionPlan.upsert({
      where: { code: 'basic_sd' },
      update: {
        name: 'Basic SD',
        priceCents: 799,
        currency: 'EUR',
        maxQuality: QualityName.SD,
        concurrentStreams: 1,
        trialDays: 7,
      },
      create: {
        code: 'basic_sd',
        name: 'Basic SD',
        priceCents: 799,
        currency: 'EUR',
        maxQuality: QualityName.SD,
        concurrentStreams: 1,
        trialDays: 7,
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(xmlparser());
    app.useGlobalInterceptors(new XmlInterceptor());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it('GET /', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'Hello Worlds!' });
  });

  it('GET / (XML)', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .set('Accept', 'application/xml')
      .expect(200);

    expect(res.headers['content-type']).toContain('application/xml');
    expect(typeof res.text).toBe('string');
    expect(res.text.trim().startsWith('<')).toBe(true);
    expect(res.text).toContain('Hello Worlds!');
  });

  it('GET /auth/reset-password returns token payload', async () => {
    await request(app.getHttpServer())
      .get('/auth/reset-password')
      .query({ token: 'abc' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          resetToken: 'abc',
          message: 'Use this token to reset your password',
        });
      });
  });

  describe('Auth (negative cases)', () => {
    it('POST /auth/login missing password -> 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUserEmail })
        .expect(400);
    });

    it('POST /auth/login invalid email -> 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: testUserPassword })
        .expect(400);
    });

    it('POST /auth/login wrong password -> 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUserEmail, password: 'WrongPassword123!' })
        .expect(401);
    });

    it('POST /auth/login unknown email -> 404', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'does.not.exist@streamflix.local', password: 'Password123!' })
        .expect(404);
    });
  });

  it('POST /auth/login returns JWT', async () => {
    const token = await getAccessToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });

  describe('Title CRUD', () => {
    let titleId: number;

    it('POST /title', async () => {
      const res = await request(app.getHttpServer())
        .post('/title')
        .send({
          name: `E2E Title ${Date.now()}`,
          type: TitleType.MOVIE,
          description: 'E2E description',
          releaseYear: 2025,
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
      titleId = res.body.id;
    });

    it('GET /title', async () => {
      const res = await request(app.getHttpServer()).get('/title').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /title/:id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/title/${titleId}`)
        .expect(200);
      expect(res.body).toHaveProperty('id', titleId);
    });

    it('PATCH /title/:id', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/title/${titleId}`)
        .send({ description: 'Updated by e2e' });
      expect([200, 201]).toContain(res.status);
    });

    it('DELETE /title/:id', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/title/${titleId}`)
        .expect(200);
      expect(res.body).toBeDefined();
    });
  });

  describe('Title (negative cases)', () => {
    it('GET /title/:id not found -> 404', async () => {
      await request(app.getHttpServer())
        .get('/title/99999999')
        .expect(404);
    });

    it('GET /title/:id invalid id -> 400', async () => {
      await request(app.getHttpServer())
        .get('/title/not-a-number')
        .expect(400);
    });

    it('POST /title invalid enum -> 400', async () => {
      await request(app.getHttpServer())
        .post('/title')
        .send({
          name: `E2E Title Invalid ${Date.now()}`,
          type: 'NOT_A_REAL_TYPE',
          description: 'bad payload',
          releaseYear: 2025,
        })
        .expect(400);
    });
  });

  describe('Subscription endpoints (JWT protected)', () => {
    let subscriptionId: number;
    let invitationCode: string;

    it('GET /subscriptions/plans without auth -> 401', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .expect(401);
    });

    it('GET /subscriptions/plans', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /subscriptions/plans (XML)', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .get('/subscriptions/plans')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/xml')
        .expect(200);

      expect(res.headers['content-type']).toContain('application/xml');
      expect(res.text.trim().startsWith('<')).toBe(true);
      expect(res.text).toContain('basic_sd');
    });

    it('POST /subscriptions without auth -> 401', async () => {
      await request(app.getHttpServer())
        .post('/subscriptions')
        .send({ userId: testUserId, planCode: 'basic_sd' })
        .expect(401);
    });

    it('POST /subscriptions invalid userId -> 400', async () => {
      const token = await getAccessToken();
      await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 0, planCode: 'basic_sd' })
        .expect(400);
    });

    it('POST /subscriptions plan not found -> 404', async () => {
      const token = await getAccessToken();
      await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: testUserId, planCode: 'does_not_exist' })
        .expect(404);
    });

    it('GET /subscriptions/:id not found -> 404', async () => {
      const token = await getAccessToken();
      await request(app.getHttpServer())
        .get('/subscriptions/99999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('POST /subscriptions (create inviter subscription)', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: testUserId, planCode: 'basic_sd' });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('id');
      subscriptionId = res.body.id;
    });

    it('POST /subscriptions (XML response)', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/xml')
        .send({ userId: inviteeUserId, planCode: 'basic_sd' });

      expect([200, 201]).toContain(res.status);
      expect(res.headers['content-type']).toContain('application/xml');
      expect(res.text.trim().startsWith('<')).toBe(true);
    });

    it('GET /subscriptions/:id', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .get(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', subscriptionId);
      expect(res.body).toHaveProperty('plan');
    });

    it('GET /subscriptions/:id (XML)', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .get(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/xml')
        .expect(200);

      expect(res.headers['content-type']).toContain('application/xml');
      expect(res.text.trim().startsWith('<')).toBe(true);
      expect(res.text).toContain('id');
    });

    it('PATCH /subscriptions/:id (toggle autoRenew)', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .patch(`/subscriptions/${subscriptionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ autoRenew: false });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('autoRenew', false);
    });

    it('POST /subscriptions/invitations', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .post('/subscriptions/invitations')
        .set('Authorization', `Bearer ${token}`)
        .send({ inviterUserId: testUserId, inviteeEmail });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('code');
      invitationCode = res.body.code;
    });

    it('POST /subscriptions/invitations duplicate active invite -> 400', async () => {
      const token = await getAccessToken();
      await request(app.getHttpServer())
        .post('/subscriptions/invitations')
        .set('Authorization', `Bearer ${token}`)
        .send({ inviterUserId: testUserId, inviteeEmail })
        .expect(400);
    });

    it('POST /subscriptions/invitations/redeem invalid code -> 404', async () => {
      const token = await getAccessToken();
      await request(app.getHttpServer())
        .post('/subscriptions/invitations/redeem')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'NO_SUCH_CODE', userId: inviteeUserId })
        .expect(404);
    });

    it('POST /subscriptions/invitations/redeem', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .post('/subscriptions/invitations/redeem')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: invitationCode, userId: inviteeUserId });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('code', invitationCode);
    });

    it('POST /subscriptions (apply invitation discount)', async () => {
      const token = await getAccessToken();
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: inviteeUserId, planCode: 'basic_sd', invitationCode });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('discountPercent', 25);
      expect(res.body).toHaveProperty('invitedByUserId', testUserId);

      // Verify the inviter also received the discount (DB assertion)
      const inviterSub = await prisma.subscription.findFirst({
        where: { userId: testUserId },
        orderBy: { currentPeriodEnd: 'desc' },
      });
      expect(inviterSub).toBeTruthy();
      expect(inviterSub?.discountPercent).toBe(25);
    });
  });
});
