# Multi-stage Dockerfile for Express Backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

# Copy source code
COPY . .

# Environment Defaults
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER node

CMD ["npm", "start"]
