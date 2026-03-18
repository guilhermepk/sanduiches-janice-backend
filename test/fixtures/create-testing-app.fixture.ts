import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import cookieParser from 'cookie-parser';
import { truncateTables } from "test/utils/truncate-tables.test-util";
import { App } from "supertest/types";
import { EnvUser } from "src/users/models/types/env-users.type";

export async function createTestingApp(config?: {
  seedUsers?: Array<EnvUser>
}): Promise<INestApplication<App>> {
  if (config?.seedUsers) {
    process.env.SEED_USERS = JSON.stringify(config.seedUsers);
  }

  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication<App> = testingModule.createNestApplication();

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  return app;
}