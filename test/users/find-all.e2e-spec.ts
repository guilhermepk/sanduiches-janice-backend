import { HttpStatus, INestApplication } from "@nestjs/common";
import { App } from "supertest/types";
import { closeTestingApp } from "test/utils/close-testing-app.test-util";
import { createTestingApp } from "test/fixtures/create-testing-app.fixture";
import request from 'supertest';
import { UnauthorizedReasonsEnum } from "src/auth/models/enums/unauthorized-reasons.enum";
import { getAuthCookies } from "test/fixtures/auth-cookies.fixture";
import { UserRolesEnum } from "src/users/models/enums/user-roles.enum";
import { truncateTables } from "test/utils/truncate-tables.test-util";
import { EnvUser } from "src/users/models/types/env-users.type";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { UserGuard } from "src/auth/guards/user.guard";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "src/users/models/entities/user.entity";

const endpoint = '/users/find-all';

describe(`Find all users (e2e) (${endpoint})`, () => {
  /*
  Respostas possíveis
  [x] 401 UNAUTHORIZED - Não autenticado
  [x] 401 UNAUTHORIZED - Não é admin
  [x] 200 OK - Usuários encontrados
  [x] 200 OK - Paginação funcionando
  [x] 400 BAD REQUEST - Parâmetros de busca incorretos
  [x] 500 INTERNAL SERVER ERROR - Erro inesperado
  */

  it('Deveria estourar Unauthorized (credenciais inválidas)', async () => {
    const app: INestApplication<App> = await createTestingApp();

    return request(app.getHttpServer())
      .get(endpoint)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({
        message: `Credenciais inválidas (${UnauthorizedReasonsEnum.ACCESS_TOKEN_ABSENCE})`,
        error: 'Unauthorized',
        statusCode: 401
      })
      .then(async (res) => {
        await truncateTables(app);
        await closeTestingApp(app);

        return res;
      });
  });

  it('Deveria estourar Unauthorized (Cargo incompatível)', async () => {
    const user: EnvUser = { name: 'Usuário', email: 'user@gmail.com', password: '123456', role: UserRolesEnum.COMMON };
    const seedUsers = [user];

    const app: INestApplication<App> = await createTestingApp({ seedUsers });

    const cookies = await getAuthCookies(app, user.email, user.password);

    return request(app.getHttpServer())
      .get(endpoint)
      .set('Cookie', cookies)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect({
        message: 'Cargo incompatível. Você não tem autorização para executar essa ação. (2)',
        error: 'Unauthorized',
        statusCode: 401
      })
      .then(async (res) => {
        await truncateTables(app);
        await closeTestingApp(app);

        return res;
      });
  });

  it('Deveria retornar os usuários do banco de dados', async () => {
    const adminUser: EnvUser = { name: 'Admin', email: 'admin@gmail.com', password: '123456', role: UserRolesEnum.ADMIN };
    const seedUsers = [adminUser];

    const app: INestApplication<App> = await createTestingApp({ seedUsers });

    const cookies = await getAuthCookies(app, adminUser.email, adminUser.password);

    return request(app.getHttpServer())
      .get(endpoint)
      .set('Cookie', cookies)
      .expect(HttpStatus.OK)
      .expect({
        items: [
          {
            id: 1,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            active: true
          }
        ],
        totalPages: 1
      })
      .then(async (res) => {
        await truncateTables(app);
        await closeTestingApp(app);
        return res;
      });
  });

  it('Deveria retornar os usuários da segunda página do banco de dados', async () => {
    const adminUser: EnvUser = { name: 'Admin', email: 'admin@gmail.com', password: '123456', role: UserRolesEnum.ADMIN };
    const commonUser: EnvUser = { name: 'Usuário', email: 'usuário@gmail.com', password: '123456', role: UserRolesEnum.COMMON };
    const seedUsers: Array<EnvUser> = [adminUser, commonUser];

    const app: INestApplication<App> = await createTestingApp({ seedUsers });

    const cookies = await getAuthCookies(app, adminUser.email, adminUser.password);

    return request(app.getHttpServer())
      .get(endpoint)
      .set('Cookie', cookies)
      .query({ quantity: 1, page: 2 })
      .expect(HttpStatus.OK)
      .expect({
        items: [
          {
            id: 2,
            name: commonUser.name,
            email: commonUser.email,
            role: commonUser.role,
            active: true
          }
        ],
        totalPages: 2
      })
      .then(async (res) => {
        await truncateTables(app);
        await closeTestingApp(app);
        return res;
      });
  });

  it('Deveria estourar Bad Request', async () => {
    const adminUser: EnvUser = { name: 'Admin', email: 'admin@gmail.com', password: '123456', role: UserRolesEnum.ADMIN };
    const seedUsers: Array<EnvUser> = [adminUser];

    const app: INestApplication<App> = await createTestingApp({ seedUsers });

    const cookies = await getAuthCookies(app, adminUser.email, adminUser.password);

    return request(app.getHttpServer())
      .get(endpoint)
      .set('Cookie', cookies)
      .query({ quantity: 'a', pageee: 2 })
      .expect(HttpStatus.BAD_REQUEST)
      .expect({
        "message": [
          "property pageee should not exist",
          "quantity must not be greater than 50",
          "quantity must be a positive number",
          "quantity must be a number conforming to the specified constraints"
        ],
        "error": "Bad Request",
        "statusCode": 400
      })
      .then(async (res) => {
        await truncateTables(app);
        await closeTestingApp(app);
        return res;
      });
  });

  it('Deveria estourar um Internal Server Error personalizado', async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideGuard(UserGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue({
        count: () => 1,
        findAndCount: () => { throw new Error('Erro no banco de dados') }
      })
      .compile();

    const app: INestApplication<App> = testingModule.createNestApplication();

    app.init();

    return request(app.getHttpServer())
      .get(endpoint)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect({
        message: 'Erro ao listar usuários. Erro no banco de dados',
        error: 'Internal Server Error',
        statusCode: 500
      })
  });
});