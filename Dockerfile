FROM node:18-alpine

# Install OpenSSL and glibc compatibility for Prisma engine binary on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy backend package configuration and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend Prisma schema and compile client
COPY backend/prisma ./backend/prisma
RUN cd backend && npx prisma generate

# Copy the rest of the repository files
COPY . .

# Ensure all binaries under node_modules are executable
RUN chmod -R 755 /app/backend/node_modules

# Change ownership of the app directory to user 1000 (Hugging Face user)
RUN chown -R 1000:1000 /app

# Set environment variables (Hugging Face expects port 7860)
ENV PORT=7860
ENV NODE_ENV=production
ENV JWT_SECRET=supersecuresecretkeysaap

# Expose port 7860
EXPOSE 7860

# Run container as user 1000
USER 1000

# Run database sync and start server from the backend subfolder
WORKDIR /app/backend
CMD npm run db:push && node src/server.js
