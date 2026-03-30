import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/env";

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
} = env as {
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: string;
  POSTGRES_DB: string;
};

console.log('POSTGRES_USER', POSTGRES_USER);
console.log('POSTGRES_PASSWORD', POSTGRES_PASSWORD);
console.log('POSTGRES_HOST', POSTGRES_HOST);
console.log('POSTGRES_PORT', POSTGRES_PORT);
console.log('POSTGRES_DB', POSTGRES_DB);
console.log('DATABASE_URL', `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`,
  },
});