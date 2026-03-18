import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/models/entities/user.entity';
import { createTestingApp } from 'test/fixtures/create-testing-app.fixture';
import { closeTestingApp } from 'test/fixtures/close-testing-app.fixture';

const endpoint = '/auth/login';

describe(`Login (e2e) (${endpoint})`, () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  /*
  Respostas possíveis
  [x] 200 OK - Login bem sucedido
  [x] 401 UNAUTHORIZED - Credenciais inválidas (Email errado)
  [x] 401 UNAUTHORIZED - Credenciais inválidas (Senha errada)
  [x] 400 BAD REQUEST - Body mal formado
  [x] 500 INTERNAL SERVER ERROR - Erro inesperado
  */

  it('Deveria realizar login com sucesso', () => {
    const body = {
      "email": process.env.EMAIL || '',
      "password": process.env.PASSWORD || ''
    }

    return request(app.getHttpServer())
      .post(endpoint)
      .send(body)
      .expect(HttpStatus.OK)
      .expect({ "success": true });
  });

  it('Deveria estourar Unauthorized (Email errado)', () => {
    const body = {
      "email": "errado@gmail.com",
      "password": process.env.PASSWORD || ''
    }

    return request(app.getHttpServer())
      .post(endpoint)
      .send(body)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({
        "message": "Email e senha não conferem",
        "error": "Unauthorized",
        "statusCode": HttpStatus.UNAUTHORIZED
      })
  });

  it('Deveria estourar Unauthorized (Senha errada)', () => {
    const body = {
      "email": process.env.EMAIL || '',
      "password": 'aaaaaaaaa'
    }

    return request(app.getHttpServer())
      .post(endpoint)
      .send(body)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({
        "message": "Email e senha não conferem",
        "error": "Unauthorized",
        "statusCode": HttpStatus.UNAUTHORIZED
      })
  });

  it('Deveria estourar Bad Request', () => {
    return request(app.getHttpServer())
      .post(endpoint)
      .send()
      .expect(HttpStatus.BAD_REQUEST)
      .expect({
        "message": [
          "email must be an email",
          "email must be a string",
          "email should not be empty",
          "password must be a string",
          "password should not be empty"
        ],
        "error": "Bad Request",
        "statusCode": 400
      });
  });

  it('Deveria estourar erro 500', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue({
        count: jest.fn().mockReturnValue(1),
        findOne: jest.fn().mockRejectedValue(new Error('Erro no banco de dados'))
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    return await request(app.getHttpServer())
      .post(endpoint)
      .send({ "email": "", "password": "" })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect({
        message: 'Erro ao buscar usuário pelo email . Erro no banco de dados',
        error: 'Internal Server Error',
        statusCode: 500
      })
  });

  afterAll(async (): Promise<void> => {
    await closeTestingApp(app);
  });
});
