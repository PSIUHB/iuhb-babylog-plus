# BabyLogPlus Backend Development

This is the backend API for the BabyLogPlus application, built with NestJS, PostgreSQL, and Redis.

## Development Setup with Hot Reloading

The development environment is configured with proper volume mounts to enable hot reloading without having to rebuild containers when you change code.

### Starting the Development Environment

```bash
# Start the development environment
docker-compose -f docker-compose.dev.yaml up -d
```

### How Hot Reloading Works

The docker-compose.dev.yaml file is configured with:

1. **Specific volume mounts** that sync only the necessary files between your local machine and the container:
   - `./src:/app/src` - Source code
   - `./package.json:/app/package.json` - Package configuration
   - `./package-lock.json:/app/package-lock.json` - Package lock file
   - `./tsconfig.json:/app/tsconfig.json` - TypeScript configuration
   - `./tsconfig.build.json:/app/tsconfig.build.json` - TypeScript build configuration
   - `./nest-cli.json:/app/nest-cli.json` - NestJS CLI configuration
   - `./.env:/app/.env` - Environment variables
   - `/app/node_modules` - Anonymous volume for node_modules

2. **File watching environment variables**:
   - `CHOKIDAR_USEPOLLING=true` - Enables polling for better file watching
   - `CHOKIDAR_INTERVAL=300` - Sets polling interval in ms

3. **Debug mode with watching**:
   - The container runs `npm run start:debug` which uses NestJS's `--watch` flag

With this configuration, when you change a file in the `src` directory, the NestJS application will automatically detect the change and restart.

### Development Commands

- Start containers: `docker-compose -f docker-compose.dev.yaml up -d`
- View logs: `docker-compose -f docker-compose.dev.yaml logs -f`
- Restart containers: `docker-compose -f docker-compose.dev.yaml restart`
- Stop containers: `docker-compose -f docker-compose.dev.yaml down`

### Accessing Services

- API: http://localhost:3000
- Database Admin (Adminer): http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: babylog
  - Password: babylog
  - Database: babylogplus