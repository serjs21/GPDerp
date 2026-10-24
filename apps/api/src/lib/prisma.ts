import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { env } from "../env";
import {
  DB_APPLICATION_NAME,
  DB_CONNECTION_TIMEOUT_MS,
  DB_IDLE_TIMEOUT_MS,
  PRISMA_POOL_MAX,
} from "../consts/database";
import { sanitizeDbError, withVerifiedTls } from "../utils/databaseUrl";

const LOG_PREFIX = "[prisma]";

// Dropped sockets (e.g. Neon scaling the compute to zero) are evicted from the pool; the next query reconnects.
const logDbError = (source: "pool" | "connection") => (err: Error) =>
  console.error(LOG_PREFIX, `${source} error`, sanitizeDbError(err));

const adapter = new PrismaPg(
  {
    connectionString: withVerifiedTls(env.DATABASE_URL),
    max: PRISMA_POOL_MAX,
    idleTimeoutMillis: DB_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: DB_CONNECTION_TIMEOUT_MS,
    keepAlive: true,
    application_name: DB_APPLICATION_NAME,
  },
  { onPoolError: logDbError("pool"), onConnectionError: logDbError("connection") },
);

export const prismaClient = new PrismaClient({ adapter });
