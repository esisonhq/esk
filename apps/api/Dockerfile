ARG BUN_VERSION_BUILD
ARG BUN_VERSION_PROD
ARG TURBO_VERSION
ARG PORT=3000
ARG NODE_ENV=production

# Base image with Bun for build stages
FROM oven/bun:${BUN_VERSION_BUILD} AS base
WORKDIR /app
RUN bun add -g turbo@${TURBO_VERSION}

# Prune the workspace to only include API and its dependencies
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune --filter=@esk/api --docker

# Install dependencies
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lockb ./bun.lockb
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=@esk/api
RUN rm -rf node_modules
RUN bun install --frozen-lockfile --production

# Runtime image
FROM oven/bun:${BUN_VERSION_PROD} AS runner

# Create non-root user for security
RUN addgroup --system --gid 1001 bunuser && \
    adduser --system --uid 1001 bunuser

WORKDIR /app

COPY --from=builder --chown=bunuser:bunuser /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=bunuser:bunuser /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=bunuser:bunuser /app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:bunuser /app/package.json ./package.json
COPY --from=builder --chown=bunuser:bunuser /app/packages ./packages

USER bunuser
WORKDIR /app/apps/api

# Set defaults that can be overridden by providers
ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV}
EXPOSE ${PORT}

# Run the built application
CMD ["bun", "run", "dist/index.js"]