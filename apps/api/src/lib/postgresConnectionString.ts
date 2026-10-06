import { env } from "../env";

/** Plain libpq URL (no Prisma `?schema=` param) for clients such as pg-boss. */
export const postgresConnectionString = (): string => {
  const user = encodeURIComponent(env.POSTGRES_USER);
  const password = encodeURIComponent(env.POSTGRES_PASSWORD);
  return `postgresql://${user}:${password}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`;
};
