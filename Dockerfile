FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install

# Build the app for production
RUN bun run build

# Expose the port your app will run on
EXPOSE 3000

# Run the production server
CMD ["bun", "run", "server.ts"]
