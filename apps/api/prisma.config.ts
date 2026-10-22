import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/env";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct connection; the pooled one breaks Prisma Migrate.
    url: env.DATABASE_URL_UNPOOLED,
  },
});
