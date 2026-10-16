# Flashcards

Aplicación web progresiva (PWA) de repaso espaciado compatible con Anki. Importa tus mazos `.apkg`, estudia con el mismo algoritmo (SM-2 clásico o FSRS), sincroniza el progreso entre escritorio y móvil, y consulta estadísticas detalladas.

## Características

- Importación de paquetes `.apkg` (formato legado y formato moderno comprimido con zstd de Anki 2.1.50+), incluyendo tipos de nota, plantillas, CSS, multimedia, opciones de mazo y el estado de programación de cada tarjeta.
- Programador SM-2 estilo Anki (pasos de aprendizaje, facilidad, intervalos, olvidos, sanguijuelas) y FSRS mediante `ts-fsrs`, configurable por preajuste de mazo.
- Mazos jerárquicos con límites diarios, submazos, opciones por preajuste y descripciones.
- Sesión de estudio con cuatro botones de respuesta e intervalos previstos, deshacer, enterrar, suspender, marcar, audio y atajos de teclado.
- Editor de notas (tipos Básico, Básico invertido y Cloze incluidos) y explorador con búsqueda, filtros y acciones masivas.
- Estadísticas: repasos por día, previsión, retención, racha, mapa de actividad anual, distribución de tarjetas e intervalos.
- Cuentas con sesiones persistentes en base de datos, zona horaria y hora de inicio del día configurables.
- PWA instalable en iOS, Android y escritorio, con service worker y página offline.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Prisma 7 con PostgreSQL, Serwist, sql.js, fflate y fzstd.

## Desarrollo

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

Variables de entorno:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL. Usa `?schema=flashcards` para aislar las tablas dentro de una base de datos compartida. |
| `SHADOW_DATABASE_URL` | Solo para `npm run db:diff`: base de datos vacía donde Prisma reproduce las migraciones. Debe usar el mismo `?schema=` que `DATABASE_URL`. |
| `SESSION_SECRET` | Cadena aleatoria larga para firmar los tokens de sesión. |
| `MEDIA_DIR` | Carpeta donde se guardan imágenes y audios importados. |
| `NEXT_PUBLIC_APP_URL` | URL pública de la aplicación. |

Scripts útiles:

```bash
npm run test        # tests unitarios (scheduler, parser de Anki, plantillas)
npm run typecheck   # tsc
npm run lint        # eslint
npm run db:diff     # genera SQL a partir de cambios en prisma/schema.prisma
```

Para crear una nueva migración tras modificar el esquema (necesita `SHADOW_DATABASE_URL` apuntando a una base de datos vacía con el mismo `?schema=`):

```bash
mkdir prisma/migrations/$(date +%Y%m%d%H%M%S)_nombre
npm run db:diff > prisma/migrations/<carpeta>/migration.sql
npx prisma migrate deploy
```

CI comprueba con `prisma migrate diff --exit-code` que `prisma/migrations` y `prisma/schema.prisma` describen lo mismo, así que una migración olvidada se detecta antes de llegar al VPS.

## Docker

La imagen se construye en varias etapas y arranca desde la salida `standalone` de Next.js. No levanta base de datos propia: se conecta al PostgreSQL que ya existe en el VPS.

| Variable | Momento | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | ejecución | Conexión a PostgreSQL. Usa `?schema=flashcards`. |
| `SESSION_SECRET` | ejecución | Secreto de firma de sesiones. |
| `MEDIA_DIR` | ejecución | Por defecto `/app/data/media` (volumen). |
| `SKIP_MIGRATIONS` | ejecución | `1` para no ejecutar `prisma migrate deploy` al arrancar. |
| `TZ` | ejecución | Zona horaria del contenedor. |
| `APP_REVISION` | build | Revisión que expone `/api/health` y usa el service worker. |
| `NEXT_PUBLIC_APP_URL` | build | Las variables `NEXT_PUBLIC_*` se incrustan en el bundle, por eso es un `build-arg` y no una variable de ejecución. |

El contenedor ejecuta `prisma migrate deploy` al arrancar (con una copia aislada del CLI de Prisma en `/app/migrator`) y después `node server.js`. Expone `/api/health`, que es también el `HEALTHCHECK` de la imagen.

Probar la imagen en local:

```bash
docker build --build-arg APP_REVISION=$(git rev-parse HEAD) -t flashcards:ci .
DATABASE_URL="postgresql://user:password@host.docker.internal:5432/database?schema=flashcards" \
  ./scripts/smoke-test.sh flashcards:ci
```

El script arranca el contenedor, espera a `/api/health`, comprueba las rutas públicas y lo elimina. Es el mismo que usa CI.

## Despliegue en Dokploy

GitHub Actions construye y publica la imagen en `ghcr.io/snthz/flashcards`; Dokploy solo la descarga. El VPS no compila nada.

1. **Paquete de GHCR**: en `https://github.com/users/snthz/packages/container/flashcards/settings` ponlo como público, o en Dokploy → *Settings* → *Registry* añade `ghcr.io` con tu usuario y un PAT con permiso `read:packages`.
2. **Servicio en Dokploy**: crea un servicio de tipo *Compose* apuntando a este repositorio (rama `main`, archivo `docker-compose.yml`).
3. **Variables de entorno** del servicio:
   - `DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@NOMBRE_DEL_SERVICIO_POSTGRES:5432/BASE?schema=flashcards`
   - `SESSION_SECRET` (por ejemplo `openssl rand -base64 48`)
   - `FLASHCARDS_IMAGE=ghcr.io/snthz/flashcards:latest` (opcional; fija un tag `sha-<commit>` para desplegar una revisión concreta)
   - `TZ` (opcional)
4. **Dominio**: añádelo al servicio `flashcards` en el puerto `3000`.
5. **Red**: el servicio se une a `dokploy-network`, que ya existe en el VPS y es donde está Traefik.
6. **Webhook**: copia la URL de despliegue del servicio y guárdala en el repositorio como secreto `DOKPLOY_WEBHOOK_URL`.

El esquema `flashcards` se crea dentro de la base de datos existente sin tocar el resto de tablas. Los archivos multimedia se guardan en el volumen `flashcards-media`.

## CI/CD

`.github/workflows/ci.yml` se ejecuta en cada pull request y en cada push a `main`, con tres trabajos en cadena:

| Trabajo | Qué hace |
| --- | --- |
| `verify` | `npm run lint`, `npm run typecheck`, `npm run test`, aplica las migraciones sobre un PostgreSQL limpio y comprueba con `prisma migrate diff --exit-code` que `prisma/migrations` y `prisma/schema.prisma` no han divergido. |
| `build` | Construye la imagen con caché de buildx, la somete al smoke test y la publica en GHCR con los tags `sha-<commit>` y `latest` (en pull requests se construye y se prueba, pero no se publica). |
| `deploy` | Solo en `main`: llama al webhook de Dokploy y espera hasta que `/api/health` devuelva el commit desplegado. |

Configuración necesaria en GitHub:

| Nombre | Tipo | Uso |
| --- | --- | --- |
| `DOKPLOY_WEBHOOK_URL` | secreto | Dispara el despliegue en Dokploy. |
| `NEXT_PUBLIC_APP_URL` | variable | URL pública; se incrusta en el build y se usa para verificar el despliegue. |

No hace falta ningún token de registro: el push a GHCR usa el `GITHUB_TOKEN` del propio workflow.

Si prefieres la API de Dokploy en lugar del webhook, sustituye el paso *Trigger Dokploy deployment* por:

```bash
curl -fsS -X POST "$DOKPLOY_URL/api/compose.deploy" \
  -H "x-api-key: $DOKPLOY_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"composeId\":\"$DOKPLOY_COMPOSE_ID\"}"
```

## Exportar desde Anki

En Anki: engranaje del mazo → Exportar → formato “Paquete de mazo de Anki (*.apkg)”, con “Incluir información de programación” e “Incluir multimedia” activados. Al reimportar un mismo mazo se actualizan las notas existentes y se conservan las tarjetas ya programadas.
