import request from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function getAuthCookies(
  app: INestApplication,
  email: string,
  password: string
): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Falha no login da fixture: ${response.status} - ${JSON.stringify(response.body)}`);
  }

  return response.headers['set-cookie'];
}