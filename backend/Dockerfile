# ---- Base Node Image ----
FROM node:20-alpine AS base
# Install tini for proper PID 1 signal handling and zombie reaping
RUN apk add --no-cache tini
WORKDIR /usr/src/app

# ---- Development stage ----
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "dev"]

# ---- Builder (production build / dependencies stage) ----
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .

# ---- Production Runtime ----
FROM base AS production
ENV NODE_ENV=production

# Copy package descriptors
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY src ./src

# Change ownership of the app directory to the non-root 'node' user
RUN chown -R node:node /usr/src/app

# Run as the built-in non-root Node user for security
USER node

EXPOSE 5000

# Use tini as entrypoint to correctly handle OS signals
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
