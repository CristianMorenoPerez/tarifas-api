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
git clone https://github.com/CristianMorenoPerez/tarifas-api.git
cd tarifas-api
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


DATABASE_URL=postgresql://user:1234@localhost:5450/energy_tariffs_db

API_TARIFA=https://datos.gov.co/resource/ytme-6qnu.json
API_TIMEOUT=30000
API_RETRIES=3
API_TIMEOUT=30000
API_RETRIES=3
EMAIL_FROM=tuemail@gmail.com
EMAIL_TO=emailreceptor@gmail.com


BREVO_API_KEY=tuapikey
BREVO_API_URL=https://api.brevo.com/v3/smtp/email


```

### 4. Iniciar la base de datos con Docker

```bash
docker-compose up -d
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
