FROM oven/bun:latest

WORKDIR /app

# Copy workspace configuration from monorepo root
COPY package.json bun.lockb ./

# Copy shared types package
COPY packages/shared-types ./packages/shared-types/

# Copy frontend application
COPY frontend ./frontend/

# Set working directory to frontend
WORKDIR /app/frontend

# Install dependencies (includes workspace packages)
RUN bun install

# Build the app for production
RUN bun run build

# Expose the port your app will run on
EXPOSE 3000

# Run the production server
CMD ["bun", "run", "server.ts"]
