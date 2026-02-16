# Monitor de Tarifas de Energía en Colombia

Aplicación fullstack que permite visualizar y monitorear las tarifas de energía eléctrica de las comercializadoras en Colombia usando datos oficiales de datos.gov.co.

## Descripción

Este proyecto consiste en:
- **Backend**: API REST con NestJS que consume datos de la API oficial, procesa un ETL automático cada 24 horas y expone endpoints para consultar tarifas
- **Base de datos**: PostgreSQL para almacenar la información de tarifas
- **Cron automático**: Ejecuta el ETL cada 2 AM para mantener los datos actualizados
- **Notificaciones por email**: Envía correos con el resultado de cada ejecución del ETL

## Requisitos previos

- Node.js (v18 o superior)
- PostgreSQL (o usar Docker)
- Docker y Docker Compose (opcional, recomendado)
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd auth-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env` (ya está configurado) o ajusta estos valores:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=energy_tariffs_db
DATABASE_URL=postgresql://postgres:1234@localhost:5450/energy_tariffs_db

API_TARIFA=https://datos.gov.co/resource/ytme-6qnu.json

API_TIMEOUT=30000
API_RETRIES=3
API_TIMEOUT=30000
API_RETRIES=3
SMTP_HOST = smtp-relay.brevo.com
SMTP_PORT = 587
SMTP_USER = 8d334d001@smtp-brevo.com
SMTP_PASS = B4FCyjq1x86OgwMb
EMAIL_FROM = cristianxavimoreno@gmail.com
EMAIL_TO   = cristian.x.moreno.perez@gmail.com

```

### 4. Iniciar la base de datos con Docker

```bash
docker-compose up -d db
```

Esto levanta solo PostgreSQL en el puerto 5450 y ejecuta `config.sql` para crear
las tablas y el procedimiento almacenado `sp_insert_tarifas_bulk`.

### 5. Aplicar el schema a la base de datos

Una vez que la BD esté corriendo, aplica el schema con Drizzle:

```bash
npx drizzle-kit push
```

Este comando:
- Conecta a PostgreSQL usando `DATABASE_URL`
- Detecta los cambios en el schema (archivos en `/src/database/pg/`)
- Aplica las migraciones a la base de datos
- Crea las tablas y relaciones necesarias

### 6. Construir el proyecto

```bash
npm run build
```

---

## Docker Compose (solo base de datos)

En producción no se usa `docker-compose` para la API (Railway la despliega desde el `Dockerfile`).
El `docker-compose.yaml` de este repo se usa únicamente para levantar la **base de datos local**.

### 1. Variables de entorno

En el archivo `.env` de la raíz asegúrate de tener, como mínimo:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=energy_tariffs_db
DATABASE_URL=postgresql://postgres:1234@localhost:5450/energy_tariffs_db

API_TARIFA=https://datos.gov.co/resource/ytme-6qnu.json

JWT_SECRET=super-secret
JWT_REFRESH_SECRET=super-refresh-secret

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=...
EMAIL_TO=...
```

Para Docker Compose, la API usa `DATABASE_URL` apuntando al servicio `db`:

```yaml
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

Esto ya está configurado en `docker-compose.yaml`.

### 2. Levantar solo Postgres con Docker Compose

#### Modo desarrollo (sin rebuild)

```bash
docker compose up -d db
```

- Levanta `db` con la imagen ya construida.
- Úsalo cuando no cambiaste `config.sql` ni necesitas reconstruir imágenes.

#### Modo producción / rebuild

```bash
docker compose up --build -d db
```

- Reconstruye y levanta el contenedor `db` (PostgreSQL) en el puerto `5450`.

Al terminar:

La API corre fuera de Compose (local con `npm run start:prod`, o en Railway).

---

## Despliegue de la API en Railway (con Dockerfile)

1. Crea servicio **PostgreSQL** en Railway y obtén su `DATABASE_URL`.
2. Aplica el schema con Drizzle apuntando a esa BD:
   ```bash
   DATABASE_URL=postgresql://usuario:password@host:puerto/base npx drizzle-kit push
   ```
3. Crea servicio **API** desde tu repo; Railway construirá con el `Dockerfile`.
4. En Variables de entorno del servicio API configura:
   - `PORT` (Railway la define; úsala)
   - `DATABASE_URL` (la de la BD de Railway)
   - `API_TARIFA`, `API_TIMEOUT`, `API_RETRIES`
   - `JWT_SECRET`, `JWT_REFRESH_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `EMAIL_FROM`, `EMAIL_TO`
5. Al terminar el deploy:
   - API: `https://<tu-servicio>.railway.app/api/v1`
   - Swagger: `https://<tu-servicio>.railway.app/docs`

### 3. Construir y correr solo la imagen de la API

Si ya tienes una base de datos PostgreSQL externa (por ejemplo en Railway o RDS),
puedes construir y correr solo la imagen de la API:

```bash
# Construir imagen
docker build -t auth-api .

# Ejecutar contenedor apuntando a una BD externa
docker run -d \
  --name auth-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL="postgresql://usuario:password@host:puerto/base" \
  -e API_TARIFA="$API_TARIFA" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  -e SMTP_HOST="$SMTP_HOST" \
  -e SMTP_PORT="$SMTP_PORT" \
  -e SMTP_USER="$SMTP_USER" \
  -e SMTP_PASS="$SMTP_PASS" \
  -e EMAIL_FROM="$EMAIL_FROM" \
  -e EMAIL_TO="$EMAIL_TO" \
  auth-api
```

Con esto puedes desplegar fácilmente la imagen en servicios como Railway, Render,
Fly.io, etc., siempre que configures las **mismas variables de entorno** y un
`DATABASE_URL` válido hacia tu base de datos en la nube.

## Desarrollo

Para correr el servidor en modo desarrollo con reinicio automático:

```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

La documentación interactiva (Swagger) en `http://localhost:3000/docs`

## Endpoints disponibles

### ETL

- **GET** `/etl/run` - Ejecuta manualmente el proceso ETL (extrae datos, transforma y carga en BD)

### Tarifas

- **GET** `/tarifas` - Obtiene tarifas con filtros y paginación
  - Query params:
    - `anio` (número, opcional) - Filtrar por año
    - `periodo` (string, opcional) - Filtrar por período
    - `comercializadora` (string, opcional) - Buscar por comercializadora
    - `nivel` (string, opcional) - Filtrar por nivel
    - `limit` (número, requerido) - Registros por página
    - `offset` (número, requerido) - Página (para paginación)

- **GET** `/tarifas/ultima-actualizacion` - Muestra cuándo se ejecutó el último ETL y cuántos registros se cargaron

## Cómo funciona el ETL

1. **Extracción**: Se conecta a la API de datos.gov.co y descarga el dataset de tarifas
2. **Transformación**: Filtra y normaliza los datos (año,periodo,operador, precios, etc.)
3. **Cargue**: Inserta los datos en PostgreSQL usando una stored procedure
4. **Notificación**: Envía un email con el resultado (cantidad de registros, duración)
5. **Automático**: Se ejecuta cada 24 horas a las 2 AM

Para probarlo manualmente, llama a `/etl/run`

## Manejo de Errores (Exception Filter)

El proyecto implementa un **Global Exception Filter** que captura todos los errores automáticamente sin necesidad de try-catch.

### Excepciones personalizadas disponibles:

```typescript
// En tus servicios, solo lanza la excepción sin try-catch:

import { BusinessException, ResourceNotFoundException } from '@/common/exceptions/custom.exceptions';

// Validación de negocio
throw new BusinessException('El monto debe ser mayor a 0');
// Respuesta: { statusCode: 400, message: "El monto debe ser mayor a 0" }

// Recurso no encontrado
throw new ResourceNotFoundException('Usuario', userId);
// Respuesta: { statusCode: 404, message: "Usuario con id xxx no fue encontrado" }

// Error de servicio externo
throw new ExternalApiException('No se pudo conectar a datos.gov.co', 'datos.gov.co');
// Respuesta: { statusCode: 502, message: "No se pudo conectar a datos.gov.co" }
```

Todas las excepciones retornan una respuesta consistente:
```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "BadRequest",
  "timestamp": "2026-02-14T10:30:00.000Z",
  "path": "/api/v1/tarifas"
}
```

## Estructura del proyecto

```
src/
├── etl/                 # Módulo del proceso ETL
│   ├── etl.controller.ts
│   ├── etl.service.ts
│   └── etl.scheduler.ts (cron job)
├── tarifas/             # Módulo para consultar tarifas
│   ├── tarifas.controller.ts
│   └── tarifas.service.ts
├── database/            # Configuración de BD con Drizzle ORM
├── common/              # Utilidades, adaptadores, DTOs
│   ├── filters/
│   │   └── global-exception.filter.ts
│   ├── exceptions/
│   │   ├── custom.exceptions.ts
│   │   └── example-usage.ts
│   ├── adapters/
│   ├── dtos/
│   └── mail/
├── config/              # Configuración y variables de entorno
└── app.module.ts
```

## Comandos útiles

```bash
# Desarrollo con hot reload
npm run start:dev

# Build para producción
npm run build

# Iniciar en producción
npm run start:prod


```

## Stack tecnológico

- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Scheduler**: @nestjs/schedule (cron jobs)
- **API Docs**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Data Source**: datos.gov.co API

## Notas

- El cron está configurado para ejecutarse cada 2 AM. Para cambiar, editar [src/etl/etl.scheduler.ts](src/etl/etl.scheduler.ts)
- Los emails se envían solo si están configuradas las credenciales SMTP
- La base de datos se resetea cada vez que ejecutas `docker-compose down && docker-compose up -d`
