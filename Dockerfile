FROM oven/bun:latest

WORKDIR /app

# Copy workspace configuration from monorepo root
COPY package.json bun.lockb ./

# Copy shared types package
COPY packages/shared-types ./packages/shared-types/

# Copy all workspace folders (Bun needs all declared workspaces to be present)
COPY api ./api/
COPY frontend ./frontend/

# Install dependencies from workspace root (must be done here!)
RUN bun install

# Set working directory to frontend
WORKDIR /app/frontend

# Build the app for production
RUN bun run build

# Expose the port your app will run on
EXPOSE 3000

# Run the production server
CMD ["bun", "run", "server.ts"]
