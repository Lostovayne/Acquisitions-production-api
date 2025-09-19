# Acquisitions Production API

Esta es una API RESTful para gestionar adquisiciones, construida con Node.js, Express, y Drizzle ORM. Utiliza Neon Local para la base de datos en desarrollo y está preparada para despliegue en producción con Docker.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu computadora:

1. **Node.js** (versión 20 o superior):
   - Descárgalo desde [nodejs.org](https://nodejs.org/).
   - Verifica la instalación: Abre una terminal y ejecuta `node --version`. Deberías ver algo como `v20.x.x`.

2. **Docker y Docker Compose**:
   - Descarga Docker Desktop desde [docker.com](https://www.docker.com/products/docker-desktop).
   - Asegúrate de que Docker esté corriendo (abre Docker Desktop).
   - Verifica: Ejecuta `docker --version` y `docker compose version` en la terminal.

3. **Git** (opcional, para clonar el repositorio):
   - Descárgalo desde [git-scm.com](https://git-scm.com/).
   - Verifica: `git --version`.

4. **Un editor de código** (como VS Code):
   - Descarga VS Code desde [code.visualstudio.com](https://code.visualstudio.com/).

## Instalación

1. **Clona o descarga el proyecto**:
   - Si usas Git: `git clone https://github.com/Lostovayne/acquisitions-production-api.git`
   - O descarga el ZIP desde GitHub y extráelo en una carpeta.

2. **Navega a la carpeta del proyecto**:
   - Abre una terminal y ve a la carpeta: `cd acquisitions-production-api`

3. **Instala dependencias locales** (opcional, para desarrollo sin Docker):
   - Ejecuta `npm install` en la terminal. Esto instala las librerías de Node.js.

## Modo Desarrollo

El modo desarrollo usa Docker para crear un entorno local con hot reload (cambios automáticos) y Neon Local para la base de datos.

### Paso 1: Configura las variables de entorno

1. Crea un archivo llamado `.env.development` en la raíz del proyecto (junto a `package.json`).
2. Copia el siguiente contenido y edítalo con tus datos (si no tienes una base de datos Neon, usa los valores por defecto para Neon Local):

   ```
   # Base de datos (Neon Local)
   DATABASE_URL=postgres://neon:npg@localhost:5432/neondb

   # JWT Secret (elige una clave segura, como una cadena aleatoria)
   JWT_SECRET=tu_clave_secreta_aqui

   # Puerto de la aplicación
   PORT=3000

   # Modo de entorno
   NODE_ENV=development

   # Otras configuraciones (si es necesario)
   ```

   - **Nota**: No subas este archivo a Git (ya está en `.gitignore`).

### Paso 2: Levanta el entorno de desarrollo

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta el comando:

   ```
   npm run docker:dev
   ```

   - Esto ejecutará el script `scripts/dev.sh`, que:
     - Verifica que Docker esté corriendo.
     - Crea la base de datos local con Neon Local.
     - Construye la imagen de Docker (solo la primera vez o si cambian dependencias).
     - Inicia los contenedores.
     - Aplica migraciones de base de datos con Drizzle.
     - Muestra logs en tiempo real.

3. Espera a que aparezca el mensaje:

   ```
   🎉 Development environment started!
   Application: http://localhost:3000
   Health Check: http://localhost:3000/health
   Database: postgres://neon:npg@localhost:5432/neondb
   ```

4. Abre tu navegador y ve a `http://localhost:3000/health` para verificar que la API esté funcionando.

### Paso 3: Desarrolla con hot reload

- Edita archivos en la carpeta `src/` (por ejemplo, `src/app.js`).
- Guarda los cambios: La aplicación se reiniciará automáticamente (hot reload).
- Si cambias `package.json` (dependencias), el script detectará y reconstruirá la imagen la próxima vez.

### Paso 4: Detén el entorno

- Presiona `Ctrl + C` en la terminal para detener los logs.
- Para detener completamente: `docker compose -f docker-compose.dev.yml down`

### Comandos útiles en desarrollo

- **Ver logs**: `npm run docker:logs`
- **Acceder al contenedor**: `npm run docker:shell` (para ejecutar comandos dentro del contenedor).
- **Reiniciar**: `npm run docker:restart`
- **Migrar base de datos manualmente**: Dentro del contenedor, ejecuta `npm run db:migrate`.

## Modo Producción

El modo producción usa Docker para crear una imagen optimizada y desplegar la aplicación.

### Paso 1: Configura las variables de entorno

1. Crea un archivo llamado `.env.production` en la raíz del proyecto.
2. Copia y edita con tus datos de producción (usa una base de datos real, no Neon Local):

   ```
   # Base de datos (ej. Neon o PostgreSQL real)
   DATABASE_URL=postgres://usuario:password@host:5432/nombre_db

   # JWT Secret (debe ser segura)
   JWT_SECRET=tu_clave_secreta_produccion

   # Puerto (puede ser diferente)
   PORT=3000

   # Modo de entorno
   NODE_ENV=production

   # Otras configuraciones
   ```

### Paso 2: Construye y despliega en producción

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta:

   ```
   npm run docker:prod
   ```

   - Esto ejecuta `scripts/prod.sh`, que:
     - Verifica que Docker esté corriendo.
     - Construye la imagen de producción.
     - Inicia los contenedores en segundo plano.
     - Aplica migraciones.

3. Verifica que esté corriendo: Ve a la URL de tu servidor (ej. `https://tu-dominio.com/health`).

### Paso 3: Detén producción

- Ejecuta: `npm run docker:prod:down`

### Comandos útiles en producción

- **Ver logs**: `docker compose -f docker-compose.prod.yml logs -f`
- **Reiniciar**: `npm run docker:prod:detached` (inicia en background).

## Estructura del Proyecto

- `src/`: Código fuente de la API.
- `drizzle/`: Migraciones de base de datos.
- `scripts/`: Scripts para desarrollo y producción.
- `docker-compose.dev.yml`: Configuración para desarrollo.
- `docker-compose.prod.yml`: Configuración para producción.
- `Dockerfile.dev`: Imagen para desarrollo.
- `Dockerfile`: Imagen para producción.

## Solución de Problemas

- **Error: Docker no está corriendo**: Abre Docker Desktop.
- **Error: .env.development no encontrado**: Crea el archivo como se indica.
- **La app no se reinicia**: Asegúrate de que los cambios sean en `src/` y guarda el archivo.
- **Problemas con la base de datos**: Ejecuta `npm run db:migrate` dentro del contenedor.
- **Puertos ocupados**: Cambia el puerto en `.env` si 3000 está en uso.

Si tienes problemas, revisa los logs con `docker compose logs` o abre un issue en GitHub.

¡Disfruta desarrollando!</content>
<parameter name="filePath">C:/Users/Deus/Desktop/acquisitions-production-api/README.md
