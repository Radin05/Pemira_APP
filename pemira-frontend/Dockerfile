# ── Build stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API base di-inline ke bundle klien saat build. Default relatif "/api/v1"
# supaya same-origin (Caddy mem-proxy /api ke backend) — tanpa masalah CORS/cookie.
ARG NEXT_PUBLIC_API_BASE=/api/v1
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Output standalone: server minimal + hanya dependency yang dipakai.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
