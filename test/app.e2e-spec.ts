import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ensureE2EEnv } from './e2e-env';
import { XmlInterceptor } from '../src/common/xml.interceptor';
import * as xmlparser from 'express-xml-bodyparser';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    ensureE2EEnv();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.use(xmlparser());
    app.useGlobalInterceptors(new XmlInterceptor());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'Hello Worlds!' });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
