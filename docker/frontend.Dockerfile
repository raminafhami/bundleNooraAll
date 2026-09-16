ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY noora_frontend/package.json noora_frontend/package-lock.json noora_frontend/.npmrc ./
RUN npm ci
COPY noora_frontend/ ./
ARG NEXT_PUBLIC_APP_URL=
ARG NEXT_PUBLIC_EXTERNAL_API_URL=/backend
ARG NEXT_PUBLIC_INTERNAL_API_URL=http://backend:4000
ARG NEXT_PUBLIC_CAPTCHA_KEY
ARG NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_IC
ARG NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_COI
ARG NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_SAMPLING
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=builder --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/next.config.js ./
USER node
EXPOSE 3000
CMD ["npm", "start", "--", "--hostname", "0.0.0.0"]
