FROM node:20-slim AS builder
# RUN apk add g++ make python3
# RUN apk add git fontconfig curl --no-cache


ENV APPDIR=/app
ENV NODE_ENV=build

##
# Create the working directory and change its ownership to "node."
RUN cd /
RUN mkdir $APPDIR
RUN chown -R node:node $APPDIR

WORKDIR $APPDIR

##
# Set the user that is to be used with this image. Using another user
# but root helps with better security of our image. The "node" user
# comes by default with node images.
USER node

##
# Separate copying package*.json from the rest of codebase to avoid
# running `npm ci` when no new packages are installed. This is to
# leverage Docker's cache system.
COPY --chown=node:node package*.json ./

ENV PUPPETEER_SKIP_DOWNLOAD true

##
# Do a clean-install of devDependencies.
RUN npm ci
##
# Now, copy the whole codebase.
COPY --chown=node:node assets ./assets/
COPY --chown=node:node src ./src/

##
# Also, add the typescript build configuration.
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node nest-cli.json ./

##
# Build the application.
RUN npm run build \
    && npm prune --production


FROM node:20-slim AS production

ENV APPDIR=/app
ENV NODE_ENV=production

##
# Create the working directory and change its ownership to "node."
RUN mkdir $APPDIR
RUN chown -R node:node $APPDIR

WORKDIR $APPDIR

##
# Bring the build from the develpment phase.
COPY --chown=node:node --from=builder ${APPDIR}/dist ./dist/
COPY --chown=node:node --from=builder ${APPDIR}/assets ./assets/
COPY --chown=node:node --from=builder ${APPDIR}/node_modules ./node_modules/

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome-stable" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable udev fonts-freefont-ttf libxss1 --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

RUN which google-chrome-stable || true

##
# Do a clean-install of dependencies.
# RUN npm ci --only=production

##
# Expose port 4000.
EXPOSE 4000

##
# Execute the application in production.
CMD ["node", "dist/main"]
