import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";

export async function createTestingApp(): Promise<INestApplication> {
  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  const app: INestApplication = testingModule.createNestApplication();

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