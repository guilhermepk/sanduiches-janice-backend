import { INestApplication } from "@nestjs/common";

export async function closeTestingApp(
  app: INestApplication
): Promise<void> {
  await app.close();
}