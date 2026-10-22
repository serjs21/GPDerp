# Fastify API image for AWS Lightsail Containers.
# Build context: apps/api. Build for the Lightsail architecture:
#   docker build --platform linux/amd64 -t gpderp-api .
# glibc (bookworm) matches the argon2 / @resvg/resvg-js "-gnu" prebuilt binaries.
# Node >= 22.12 is required (pg-boss engines, require() of ESM-only lodash-es).

ARG NODE_IMAGE=node:22-bookworm-slim

# ---- build: full install, generate the Prisma client, compile TypeScript ----
FROM ${NODE_IMAGE} AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY assets ./assets
COPY src ./src
# prisma.config.ts reads DATABASE_URL_UNPOOLED from process.env only; generate needs no secrets.
RUN pnpm exec prisma generate && pnpm build

# ---- prod-deps: runtime dependencies only (installed on Linux for native binaries) ----
FROM ${NODE_IMAGE} AS prod-deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

# ---- runtime ----
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node
EXPOSE 8080
CMD ["node", "dist/index.js"]
