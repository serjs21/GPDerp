import { env } from "../env";

/** Direct (unpooled) Neon URL for clients that keep long-lived sessions, such as pg-boss. */
export const postgresConnectionString = (): string => env.DATABASE_URL_UNPOOLED;
