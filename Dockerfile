# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.19.0

# ---- 1) frontend build (glibc; only ever runs in CI) ----
FROM node:${NODE_VERSION}-bookworm-slim AS build
ENV CYPRESS_INSTALL_BINARY=0
# Public path the SPA is served under (nginx: /didactictel/ and /didactictel/api/)
ARG VITE_BASE=/didactictel/
ENV VITE_BASE=${VITE_BASE}
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---- 2) server runtime deps (musl, so sqlite3 gets the linuxmusl prebuilt) ----
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=optional \
 && node --input-type=module -e "import s from 'sqlite3'; new s.Database(':memory:', e => { if (e) { console.error(e); process.exit(1); } });"

# ---- 3) runtime ----
FROM node:${NODE_VERSION}-alpine AS runtime
LABEL org.opencontainers.image.source="https://github.com/YohannsJ/IntraTEL"
ENV NODE_ENV=production PORT=3001
WORKDIR /app
# package.json is required: it carries "type": "module"
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY server ./server
COPY --from=build /app/dist ./dist
RUN mkdir -p /app/server/data && chown node:node /app/server/data
USER node
EXPOSE 3001
CMD ["node", "server/server.js"]
