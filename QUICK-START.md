# Quick Start Guide

## 🚀 Development Setup (5 minutes)

### 1. Get Neon Credentials

1. Go to [console.neon.com](https://console.neon.com)
2. Create/select your project
3. Get these values:
   - **API Key**: Account Settings → API Keys → Generate new key
   - **Project ID**: Project Settings → General → Project ID
   - **Branch ID**: Branches → Copy main branch ID

### 2. Configure Environment

```bash
# Copy the template
cp .env.development .env.dev.local

# Edit with your values
nano .env.dev.local
```

Required values:

```env
NEON_API_KEY=neon_api_xxxxxxxxxxxxx
NEON_PROJECT_ID=autumn-waterfall-12345678
PARENT_BRANCH_ID=br_xxxxxxxxxxxxxxxxx
JWT_SECRET=your_dev_secret_123
```

### 3. Start Development

```bash
# Option 1: Use the helper script
./start-dev.sh

# Option 2: Direct Docker Compose
docker-compose -f docker-compose.dev.yml --env-file .env.dev.local up --build
```

### 4. Verify Setup

- **API Health**: http://localhost:3000/health
- **API Root**: http://localhost:3000
- **Database**: Automatically connected via Neon Local

---

## 🏭 Production Setup

### 1. Configure Production Environment

```bash
cp .env.production.template .env.production
# Edit with your production Neon Cloud URL and secrets
```

### 2. Deploy

```bash
# Option 1: Use the helper script
./start-prod.sh

# Option 2: Direct Docker Compose
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build
```

---

## 🔧 Common Commands

```bash
# Development
npm run docker:dev           # Start dev environment
npm run docker:dev:detached  # Start dev in background
npm run docker:dev:down      # Stop dev environment

# Production
npm run docker:prod          # Start prod environment
npm run docker:prod:detached # Start prod in background
npm run docker:prod:down     # Stop prod environment

# Database operations (in development)
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

---

## 🐛 Troubleshooting

**Neon Local won't start:**

- Check your NEON_API_KEY is valid
- Verify NEON_PROJECT_ID exists
- Ensure PARENT_BRANCH_ID is correct

**App can't connect to database:**

- Wait for Neon Local health check to pass
- Check Docker network connectivity
- Review container logs: `docker-compose logs`

**For more help, see [README-DOCKER.md](./README-DOCKER.md)**
