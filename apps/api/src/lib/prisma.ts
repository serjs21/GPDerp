import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { env } from "../env";

const adapter = new PrismaPg(env.DATABASE_URL);

export const prismaClient = new PrismaClient({ adapter });
