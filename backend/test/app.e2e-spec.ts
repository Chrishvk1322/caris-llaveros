import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /qr sin token responde 401 (ruta protegida por JWT)', () => {
    return request(app.getHttpServer()).get('/qr').expect(401);
  });

  it('GET /productos sin token responde 401', () => {
    return request(app.getHttpServer()).get('/productos').expect(401);
  });

  it('POST /productos sin token responde 401', () => {
    return request(app.getHttpServer()).post('/productos').expect(401);
  });

  it('GET /productos/:id/foto es pública: producto inexistente responde 404, no 401', () => {
    return request(app.getHttpServer())
      .get('/productos/00000000-0000-0000-0000-000000000000/foto')
      .expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
