import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/models/entities/user.entity';
import { createTestingApp } from 'test/fixtures/create-testing-app.fixture';
import { closeTestingApp } from 'test/utils/close-testing-app.test-util';
import { UserRolesEnum } from 'src/users/models/enums/user-roles.enum';
import { truncateTables } from 'test/utils/truncate-tables.test-util';
import { EnvUser } from 'src/users/models/types/env-users.type';

const endpoint = '/auth/login';

describe(`Login (e2e) (${endpoint})`, () => {
  const adminUser: EnvUser = { name: 'Admin', email: 'admin@gmail.com', password: '123456', role: UserRolesEnum.ADMIN };

  let app: INestApplication<App>;

  beforeAll(async () => {
    const seedUsers = [adminUser];

    app = await createTestingApp({ seedUsers });
  });

  /*
  Respostas possíveis
  [x] 200 OK - Login bem sucedido
  [x] 401 UNAUTHORIZED - Credenciais inválidas (Email errado)
  [x] 401 UNAUTHORIZED - Credenciais inválidas (Senha errada)
  [x] 400 BAD REQUEST - Body mal formado
  [x] 500 INTERNAL SERVER ERROR - Erro inesperado
  */

  it('Deveria realizar login com sucesso, em menos de 1 segundo', async () => {
    const body = {
      "email": adminUser.email,
      "password": adminUser.password
    }

    const startTime = performance.now();

    await request(app.getHttpServer())
      .post(endpoint)
      .send(body)
      .expect(HttpStatus.OK)
      .expect({ "success": true })

    const endTime = performance.now();

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(1 * 1000);
  });

  it('Deveria estourar Unauthorized (Email errado)', () => {
    const body = {
      "email": "errado@gmail.com",
      "password": adminUser.password
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
      "email": adminUser.email,
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

  it('Deveria estourar um Internal Server Error personalizado', async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue({
        count: jest.fn().mockReturnValue(1),
        findOne: jest.fn().mockRejectedValue(new Error('Erro no banco de dados'))
      })
      .compile();

    app = testingModule.createNestApplication();
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
    await truncateTables(app);
    await closeTestingApp(app);
  });
});
