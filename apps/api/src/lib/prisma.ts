import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { env } from "../env";

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

const databaseUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;
console.log('databaseUr client', databaseUrl);

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set");
}

const adapter = new PrismaPg(databaseUrl);

export const prismaClient = new PrismaClient({ adapter });
