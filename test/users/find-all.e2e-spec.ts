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

const endpoint = '/users/find-all';

describe(`Find all users (e2e) (${endpoint})`, () => {
  /*
  Respostas possíveis
  [x] 401 UNAUTHORIZED - Não autenticado
  [x] 200 OK - Usuários encontrados
  [ ] 500 INTERNAL SERVER ERROR - Erro inesperado
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
});