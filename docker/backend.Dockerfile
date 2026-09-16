ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE} AS base
# Slim has no system CA bundle yet. Bootstrap HTTPS using Node's bundled CAs.
RUN node -e "const fs=require('fs');fs.mkdirSync('/etc/ssl/certs',{recursive:true});fs.writeFileSync('/etc/ssl/certs/ca-certificates.crt',require('tls').rootCertificates.join('\n')+'\n')" \
    && sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources

FROM base AS builder
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN apt-get -o Acquire::Retries=3 update && apt-get -o Acquire::Retries=3 install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY noora-flow/package.json noora-flow/package-lock.json ./
RUN npm ci
COPY noora-flow/src ./src
COPY noora-flow/tsconfig*.json noora-flow/nest-cli.json ./
RUN npm run build && npm prune --omit=dev

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production APP_PORT=4000 PUPPETEER_SKIP_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
# The application currently uses this Chrome path explicitly.
RUN apt-get -o Acquire::Retries=3 update && apt-get -o Acquire::Retries=3 install -y --no-install-recommends chromium fonts-freefont-ttf fonts-noto-core ca-certificates \
    && ln -s /usr/bin/chromium /usr/bin/google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./
COPY --chown=node:node nait-templates/ ./assets/templates/
COPY --chown=node:node nait-diagrams/ ./assets/diagrams/
RUN mkdir -p statics/bpmn statics/public inspection-files documents users-docs asset-requirements tickts app-docs assets/pettyCost assets/pettyCash assets/projectTask \
    && chown node:node /app \
    && chown -R node:node statics inspection-files documents users-docs asset-requirements tickts app-docs assets/pettyCost assets/pettyCash assets/projectTask
USER node
EXPOSE 4000
CMD ["node", "dist/main"]
