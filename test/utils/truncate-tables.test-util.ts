import { INestApplication } from "@nestjs/common";
import { DataSource } from "typeorm";

export async function truncateTables(
  app: INestApplication
) {
  const connection = app.get(DataSource);

  await connection.query(truncateQueryFactory('users'));
}

function truncateQueryFactory(
  tableName: string
): string {
  const dbSchema = process.env.DB_SCHEMA || 'public';

  return `TRUNCATE TABLE ${dbSchema}.${tableName} RESTART IDENTITY CASCADE;`;
}