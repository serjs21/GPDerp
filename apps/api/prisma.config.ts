import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct connection; the pooled one breaks Prisma Migrate.
    // Read directly (not via src/env) so `prisma generate` runs in the Docker build without app secrets.
    url: process.env.DATABASE_URL_UNPOOLED ?? "",
  },
});
