# Fastify API image for AWS Lightsail Containers.
# Build context: apps/api. Build for the Lightsail architecture:
#   docker build --platform linux/amd64 -t gpderp-api .
# glibc (bookworm) matches the argon2 / @resvg/resvg-js "-gnu" prebuilt binaries.
# Node >= 22.12 is required (pg-boss engines, require() of ESM-only lodash-es).
# No secrets in ARG/ENV or files: every credential is injected at run time (Lightsail deployment env).
# Migrations never run here; see infra/aws/README.md.

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
# Commit the image was built from (infra/aws/build.sh); reported as the release by logs and error tracking.
ARG GIT_SHA=unknown
# Heap cap leaves room in a 1 GB container for native memory (argon2, resvg, Prisma WASM).
ENV NODE_ENV=production \
    PORT=8080 \
    NODE_OPTIONS=--max-old-space-size=512 \
    APP_RELEASE=${GIT_SHA}
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node
EXPOSE 8080
# Local/docker-compose liveness; Lightsail uses its own endpoint health check (/healthz).
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "dist/index.js"]
