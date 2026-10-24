import { env } from "../env";
import { withVerifiedTls } from "../utils/databaseUrl";

/** Direct (unpooled) Neon URL for clients that keep long-lived sessions, such as pg-boss. */
export const postgresConnectionString = (): string => withVerifiedTls(env.DATABASE_URL_UNPOOLED);
