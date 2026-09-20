# Caris — Sistema de Gestión de Descuentos y Validación NFC

Panel administrativo para registrar ventas de promociones a clientes de tiendas aliadas. El cliente consulta sus promociones disponibles buscando su DNI (desde un QR/NFC genérico fijo en el mostrador), y el cajero valida el canje con el PIN de la tienda.

## Qué contiene este repositorio

Monorepo con dos proyectos independientes (cada uno con su propio `package.json`, `pnpm-lock.yaml` y `.env`; no hay `package.json` en la raíz):

| Ruta | Contenido |
| --- | --- |
| `backend/` | API en NestJS 12 + Prisma 7 + PostgreSQL. Incluye `Dockerfile` y las migraciones en `prisma/migrations/`. |
| `frontend/` | Aplicación Angular 22 con Tailwind CSS v4: panel de administración (`/admin`) y páginas públicas de canje (`/buscar`, `/nfc/:token`). |
| `docker-compose.yml` | Ejecuta **solo el backend** como contenedor en la VM de producción (el frontend no se contenedoriza). |
| `.env.example` | Plantilla del `.env` que va **en la VM** junto al `docker-compose.yml` (imagen del backend y variables de runtime). |
| `.github/workflows/ci.yml` | CI: lint, build y tests de backend y frontend en cada push y en PRs hacia `main`. |
| `.github/workflows/cd.yml` | CD: tras un CI exitoso en `main`, publica la imagen del backend en `ghcr.io` y despliega por SSH en la VM. |
| `DEPLOYMENT.md` | Guía de despliegue **antigua** (VPS con Nginx + PM2, sin Docker). Está desactualizada respecto al flujo actual descrito abajo. |

## Producción: Docker + GitHub Actions

En producción el backend corre como contenedor Docker en una VM de Azure y el frontend se sirve como archivos estáticos con Nginx (instalado en el host, fuera de Docker). La base de datos **no** vive en este repositorio: es un Postgres compartido en otro repositorio (`vm-infra`), al que el backend se conecta por la red Docker externa `red-compartida`.

Flujo de despliegue:

1. Un push a `main` dispara **CI** (`ci.yml`).
2. Si CI termina en verde, **CD** (`cd.yml`) construye `backend/Dockerfile`, sube la imagen a `ghcr.io/<usuario>/caris-backend` y, por SSH, actualiza la VM (`docker compose pull` + `up -d` + `prisma migrate deploy` dentro del contenedor).
3. En paralelo, CD compila el frontend con la URL real del backend y copia `dist/frontend/browser/` a `/var/www/caris/frontend` en la VM.

Configuración necesaria antes del primer despliegue (estado actual: pendiente):

- Secrets del repositorio en GitHub: `VM_HOST`, `VM_USER`, `VM_SSH_KEY`, `API_BASE_URL`.
- En la VM: carpeta `/opt/caris` con el `docker-compose.yml` y un `.env` real (copiado de `.env.example`).

## Requisitos previos (desarrollo local)

En local no se usa Docker: backend y frontend corren directamente contra un PostgreSQL local. Instala estas herramientas antes de empezar:

| Herramienta | Versión mínima | Dónde conseguirla |
| --- | --- | --- |
| Node.js | 22 LTS (la que usan CI y Docker) | https://nodejs.org/ |
| pnpm | 12.x (fijada en `packageManager` de cada `package.json`) | https://pnpm.io/installation (o vía Corepack, ver abajo) |
| PostgreSQL | 14 o superior | https://www.postgresql.org/download/ |
| Git | cualquiera reciente | https://git-scm.com/downloads |

Este proyecto usa **pnpm** como gestor de paquetes (no npm/yarn) en ambos proyectos. La forma más simple de obtenerlo es con Corepack (viene incluido con Node), que instala la versión exacta fijada en `packageManager`:

```bash
corepack enable
corepack prepare pnpm@12.3.4 --activate
```

Los clientes acceden escaneando **un solo** QR o tag NFC genérico (el mismo para todos, pegado en el mostrador de cada tienda aliada) que apunta a `{APP_BASE_URL}/buscar` — no se graba nada por venta. Para grabar ese tag NFC genérico (una única vez por tienda) necesitas la app **NFC Tools**:
- Android: https://play.google.com/store/apps/details?id=com.wakdev.wdnfc
- iOS: https://apps.apple.com/app/nfc-tools/id1252962749

## 1. Clonar y preparar el backend

```bash
cd backend
pnpm install

# Copia el archivo de ejemplo y completa tus credenciales locales
cp .env.example .env
```

Edita `backend/.env`:
- `DATABASE_URL`: apunta a tu PostgreSQL local (crea antes la base de datos, ej. `createdb llaveros`).
- `JWT_SECRET`: cualquier cadena aleatoria para desarrollo.
- `APP_BASE_URL`: `http://localhost:4200` (URL del frontend, se usa para armar los enlaces `/nfc/{token}`).
- `PORT`: `3000` por defecto.

Aplica las migraciones y crea el usuario admin de prueba:

```bash
pnpm exec prisma migrate deploy
pnpm exec tsx prisma/seed.ts
```

Esto crea el usuario **admin@llaveros.local** / **admin1234** (cámbialo antes de producción).

Levanta el backend:

```bash
pnpm start:dev
```

Debe quedar escuchando en `http://localhost:3000`.

## 2. Preparar el frontend

En otra terminal:

```bash
cd frontend
pnpm install

# Copia el archivo de ejemplo y completa la URL del backend
cp .env.example .env
```

Edita `frontend/.env`:
- `API_BASE_URL`: `http://localhost:3000` (o la URL donde corre tu backend).
- `NODE_ENV`: `development` para desarrollo local.

> Angular no lee `.env` de forma nativa: `pnpm start` y `pnpm build` regeneran automáticamente `src/environments/environment.ts` a partir de este archivo (ver `frontend/scripts/generate-env.mjs`, encadenado dentro de esos mismos scripts). No lo edites a mano — usa siempre `pnpm start` / `pnpm build`, no `pnpm exec ng serve` / `pnpm exec ng build` directamente, para que la variable se recargue.

Levanta el frontend:

```bash
pnpm start
```

Debe quedar disponible en `http://localhost:4200`.

## 3. Primer uso

1. Entra a `http://localhost:4200/admin/login` con `admin@llaveros.local` / `admin1234`.
2. Crea una **Tienda** (con su PIN de cajero) y una **Promoción** para esa tienda.
3. Ve a **Realizar venta**, selecciona la promoción y registra al cliente (nombre completo + DNI).
4. (Una sola vez, no por venta) Con NFC Tools, graba `http://localhost:4200/buscar` en un chip NTAG21x genérico (función *Write* → *URL/URI*) y activa *Lock Tag*; o simplemente imprime esa URL como QR. Colócalo en el mostrador de la tienda.
5. El cliente escanea ese QR/tag genérico, llega a `http://localhost:4200/buscar`, ingresa su DNI y ve sus promociones disponibles (con su estado). Al elegir una, el cajero ingresa el PIN de la tienda para aplicarla.

## Comandos útiles

| Comando | Dónde | Qué hace |
| --- | --- | --- |
| `pnpm start:dev` | `backend/` | Backend con recarga automática |
| `pnpm exec prisma studio` | `backend/` | Explorador visual de la base de datos |
| `pnpm exec prisma migrate dev --name <nombre>` | `backend/` | Crear una nueva migración en desarrollo |
| `pnpm exec tsx prisma/create-admin.ts <email> <password>` | `backend/` | Crear (o resetear la contraseña de) un usuario admin del panel |
| `pnpm start` | `frontend/` | Frontend en modo desarrollo (regenera `.env` y corre `ng serve`) |
| `pnpm build` | `frontend/` | Build de producción en `frontend/dist/frontend/browser` |
| `pnpm lint` / `pnpm test` / `pnpm test:e2e` | `backend/` | Lint (oxlint), tests unitarios y e2e (el e2e necesita un Postgres accesible vía `DATABASE_URL`) |
| `pnpm exec ng test` | `frontend/` | Tests unitarios (Vitest) |

Ejemplo para crear un nuevo admin (o cambiar la contraseña de uno existente, ya que el comando hace upsert por email):

```bash
cd backend
pnpm exec tsx prisma/create-admin.ts admin@caris.com "unaContraseñaSegura"
```
