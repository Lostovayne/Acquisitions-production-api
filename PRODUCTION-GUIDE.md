# 🚀 Production Deployment Guide

## ✅ Pre-requisitos para Producción

Antes de desplegar en producción, asegúrate de tener:

1. **Base de datos Neon Cloud configurada** (no Neon Local)
2. **Secretos de producción seguros**
3. **Docker funcionando**
4. **Variables de entorno configuradas**

## 🔧 Configuración Paso a Paso

### 1. Configurar Variables de Entorno

```bash
# Copia el template
cp .env.production.template .env.production

# Edita con tus valores reales
nano .env.production
```

**Variables críticas para actualizar:**

- `DATABASE_URL`: Tu URL real de Neon Cloud
- `JWT_SECRET`: Un secreto largo y aleatorio
- `CORS_ORIGIN`: Tu dominio de producción
- `ARCJET_KEY`: Tu clave de Arcjet (opcional)

### 2. Validar Configuración

```bash
# Ejecuta validación antes de desplegar
./scripts/validate-prod.sh
```

### 3. Desplegar en Producción

```bash
# Opción 1: Script completo (recomendado)
./scripts/prod.sh

# Opción 2: Usando npm
npm run docker:prod

# Opción 3: Docker Compose directo
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## 📊 Monitoreo y Administración

### Comandos Útiles

```bash
# Ver logs en tiempo real
docker logs -f acquisitions-api-prod

# Ver logs de Docker Compose
docker compose -f docker-compose.prod.yml logs -f

# Verificar estado
docker compose -f docker-compose.prod.yml ps

# Parar aplicación
docker compose -f docker-compose.prod.yml down

# Ejecutar migraciones manualmente
docker compose -f docker-compose.prod.yml exec app npm run db:migrate

# Acceder al contenedor
docker compose -f docker-compose.prod.yml exec app bash
```

### Health Checks

- **Endpoint**: http://localhost:3000/health
- **Respuesta esperada**: `{"status":"OK","timestamp":"...","uptime":...}`

### Verificar Funcionamiento

```bash
# Test básico
curl http://localhost:3000/health

# Test completo
curl -i http://localhost:3000/api
```

## 🔒 Características de Seguridad

La configuración de producción incluye:

- ✅ **Usuario no-root** en el contenedor
- ✅ **Filesystem read-only**
- ✅ **Capacidades mínimas**
- ✅ **Límites de recursos** (CPU/Memoria)
- ✅ **Health checks automáticos**
- ✅ **Conexión directa a Neon Cloud**
- ✅ **Variables de entorno seguras**

## 🚨 Troubleshooting

### Problema: Contenedor no inicia

```bash
# Verificar logs
docker compose -f docker-compose.prod.yml logs

# Verificar configuración
./scripts/validate-prod.sh

# Verificar recursos del sistema
docker system df
```

### Problema: No puede conectar a la base de datos

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Test de conexión desde el contenedor
docker compose -f docker-compose.prod.yml exec app node -e "
const { sql } = require('./src/config/database.js');
sql\`SELECT 1\`.then(() => console.log('✅ DB Connected')).catch(console.error);
"
```

### Problema: Migraciones fallan

```bash
# Ejecutar migraciones manualmente
docker compose -f docker-compose.prod.yml exec app npm run db:migrate

# Ver estado de migraciones
docker compose -f docker-compose.prod.yml exec app npm run db:studio
```

## 🌐 Despliegue en Servidores Cloud

### AWS ECS/Fargate

1. Sube la imagen a ECR
2. Configura variables de entorno en Task Definition
3. Usa el `docker-compose.prod.yml` como referencia

### DigitalOcean Droplet

```bash
# En el servidor
git clone <tu-repo>
cd acquisitions-production-api
cp .env.production.template .env.production
# Editar .env.production con valores reales
./scripts/prod.sh
```

### Docker Swarm

```bash
# Desplegar como stack
docker stack deploy -c docker-compose.prod.yml acquisitions-stack
```

## 🔄 Actualización de Producción

```bash
# Parar aplicación actual
docker compose -f docker-compose.prod.yml down

# Actualizar código
git pull origin main

# Reconstruir y desplegar
./scripts/prod.sh
```

## 📈 Métricas y Logs

- **Logs de aplicación**: JSON estructurado
- **Health checks**: Cada 30 segundos
- **Restart policy**: `unless-stopped`
- **Resource limits**: 1 CPU, 512MB RAM

---

**⚠️ Importante**: Nunca uses credenciales de desarrollo en producción. Siempre valida tu configuración antes de desplegar.
