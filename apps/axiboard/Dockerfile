# Axiboard production image (C162)
# Build from axicharts monorepo root:
#   docker build -f apps/axiboard/Dockerfile -t axiboard:local .

FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --frozen-lockfile \
  && pnpm --filter @axicharts/charts-spec build \
  && pnpm --filter @axicharts/charts-planner build \
  && pnpm --filter @axicharts/axiboard build \
  && pnpm --filter @axicharts/axiboard build:server

WORKDIR /app/apps/axiboard

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "dist-server/index.js"]
