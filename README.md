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

Para crear una nueva migración tras modificar el esquema:

```bash
mkdir prisma/migrations/$(date +%Y%m%d%H%M%S)_nombre
npm run db:diff > prisma/migrations/<carpeta>/migration.sql
npx prisma migrate deploy
```

## Despliegue en Dokploy

La imagen no levanta base de datos propia: se conecta al PostgreSQL que ya existe en el VPS a través de la red `dokploy-network`.

1. En Dokploy crea un servicio de tipo Compose apuntando a este repositorio.
2. Define las variables de entorno:
   - `DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@NOMBRE_DEL_SERVICIO_POSTGRES:5432/BASE?schema=flashcards`
   - `SESSION_SECRET` (por ejemplo `openssl rand -base64 48`)
   - `NEXT_PUBLIC_APP_URL=https://tu-dominio`
3. Añade el dominio al servicio `flashcards` en el puerto `3000`.
4. Despliega. El contenedor ejecuta `prisma migrate deploy` al arrancar y crea el esquema `flashcards` en la base de datos existente sin tocar el resto de tablas.

Los archivos multimedia se guardan en el volumen `flashcards-media`.

## Exportar desde Anki

En Anki: engranaje del mazo → Exportar → formato “Paquete de mazo de Anki (*.apkg)”, con “Incluir información de programación” e “Incluir multimedia” activados. Al reimportar un mismo mazo se actualizan las notas existentes y se conservan las tarjetas ya programadas.
