# Acquisitions Production API - Docker Setup

This guide explains how to run the Acquisitions Production API using Docker with Neon Database in both development and production environments.

## Table of Contents

- [Development Setup (Neon Local)](#development-setup-neon-local)
- [Production Setup (Neon Cloud)](#production-setup-neon-cloud)
- [Environment Configuration](#environment-configuration)
- [Docker Commands](#docker-commands)
- [Troubleshooting](#troubleshooting)

## Development Setup (Neon Local)

For development, we use **Neon Local** - a proxy service that creates ephemeral database branches automatically. This provides isolated, fresh databases for each development session.

### Prerequisites

1. **Neon Account**: Sign up at [console.neon.com](https://console.neon.com)
2. **Docker & Docker Compose**: Install from [docker.com](https://docker.com)
3. **Neon API Key**: Generate from your Neon console

### Setup Steps

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd acquisitions-production-api
   ```

2. **Configure development environment**:

   ```bash
   cp .env.development .env.dev.local
   ```

   Edit `.env.dev.local` and add your Neon credentials:

   ```env
   NEON_API_KEY=your_neon_api_key_here
   NEON_PROJECT_ID=your_neon_project_id_here
   PARENT_BRANCH_ID=your_parent_branch_id_here
   JWT_SECRET=your_development_jwt_secret
   ```

3. **Start development environment**:
   ```bash
   docker-compose -f docker-compose.dev.yml --env-file .env.dev.local up --build
   ```

### How Development Environment Works

- **Neon Local Container**: Runs on `localhost:5432`, acts as a proxy to Neon Cloud
- **App Container**: Connects to `neon-local:5432` (internal Docker network)
- **Ephemeral Branches**: New database branch created on startup, deleted on shutdown
- **Hot Reload**: Source code mounted for development with `--watch` mode

### Development Database Connection

The application connects to Neon Local using:

```
postgres://neon:npg@neon-local:5432/main?sslmode=require
```

Neon Local automatically:

- Creates a fresh database branch from your parent branch
- Proxies connections to your Neon Cloud project
- Deletes the branch when the container stops

## Production Setup (Neon Cloud)

For production, the application connects directly to Neon Cloud database without any proxy.

### Prerequisites

1. **Production Neon Database**: Set up your production database at [console.neon.com](https://console.neon.com)
2. **Container Registry**: Docker Hub, AWS ECR, or similar
3. **Deployment Platform**: AWS ECS, DigitalOcean, Kubernetes, etc.

### Setup Steps

1. **Configure production environment**:

   ```bash
   cp .env.production.template .env.production
   ```

   Edit `.env.production` with your production values:

   ```env
   DATABASE_URL=postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   JWT_SECRET=your_strong_production_jwt_secret
   CORS_ORIGIN=https://yourdomain.com
   ARCJET_KEY=your_arcjet_key_here
   ```

2. **Build and run production**:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up --build
   ```

### Production Database Connection

The application connects directly to Neon Cloud using your production `DATABASE_URL`:

```
postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

## Environment Configuration

### Development (.env.development)

```env
NODE_ENV=development
DATABASE_URL=postgres://neon:npg@neon-local:5432/main?sslmode=require
NEON_API_KEY=your_neon_api_key
NEON_PROJECT_ID=your_neon_project_id
PARENT_BRANCH_ID=your_parent_branch_id
```

### Production (.env.production)

```env
NODE_ENV=production
DATABASE_URL=postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your_production_jwt_secret
```

## Docker Commands

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Clean up (remove volumes and networks)
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
```

### Production Commands

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up --build

# Start in detached mode
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

### Database Management

```bash
# Run database migrations (development)
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate new migration
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Open Drizzle Studio (development)
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## Architecture Overview

### Development Architecture

```
Developer Machine
├── Docker Compose
│   ├── Neon Local Proxy (Port 5432)
│   │   ├── Creates ephemeral branch
│   │   ├── Proxies to Neon Cloud
│   │   └── Auto-cleanup on shutdown
│   └── API Application (Port 3000)
│       └── Connects to neon-local:5432
└── Neon Cloud (via proxy)
    └── Your Neon Project
```

### Production Architecture

```
Production Environment
├── API Application (Port 3000)
│   └── Direct connection to Neon Cloud
└── Neon Cloud Database
    └── Production Database URL
```

## Getting Neon Credentials

1. **Sign in to Neon Console**: [console.neon.com](https://console.neon.com)
2. **API Key**: Go to Account Settings → API Keys → Generate new key
3. **Project ID**: Go to your project → Settings → General → Project ID
4. **Branch ID**: Go to your project → Branches → Copy the branch ID
5. **Database URL**: Go to your project → Dashboard → Connection string

## Health Checks

The application includes health checks for monitoring:

- **Endpoint**: `GET /health`
- **Response**:
  ```json
  {
    "status": "OK",
    "timestamp": "2025-09-18T10:30:00.000Z",
    "uptime": 120.5
  }
  ```

## Troubleshooting

### Development Issues

**Neon Local not connecting:**

```bash
# Check Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec neon-local env | grep NEON
```

**Application can't connect to database:**

```bash
# Check if Neon Local is healthy
docker-compose -f docker-compose.dev.yml ps

# Test connection manually
docker-compose -f docker-compose.dev.yml exec app node -e "
import { db } from './src/config/database.js';
console.log('Testing database connection...');
"
```

### Production Issues

**Database connection errors:**

- Verify your `DATABASE_URL` is correct
- Check firewall settings allow connections to Neon Cloud
- Ensure SSL is properly configured

**Container startup issues:**

```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs app

# Check environment variables
docker-compose -f docker-compose.prod.yml exec app env
```

## Security Considerations

### Development

- Uses ephemeral database branches (automatically cleaned up)
- Self-signed certificates for Neon Local communication
- Debug logging enabled

### Production

- Direct encrypted connection to Neon Cloud
- Security hardening with read-only filesystem
- Resource limits and non-root user
- Minimal container capabilities

## Deployment Examples

### AWS ECS with Fargate

```bash
# Build and push to ECR
docker build -t your-account.dkr.ecr.region.amazonaws.com/acquisitions-api:latest .
docker push your-account.dkr.ecr.region.amazonaws.com/acquisitions-api:latest

# Deploy with environment variables set in ECS task definition
```

### DigitalOcean App Platform

```yaml
# .do/app.yaml
services:
  - name: api
    source_dir: /
    dockerfile_path: Dockerfile
    envs:
      - key: DATABASE_URL
        value: ${DATABASE_URL}
      - key: JWT_SECRET
        value: ${JWT_SECRET}
```

## Support

For issues related to:

- **Neon Database**: [Neon Documentation](https://neon.com/docs)
- **Neon Local**: [Neon Local GitHub](https://github.com/neondatabase-labs/neon_local)
- **Application**: Check the logs and health endpoint
