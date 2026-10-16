#!/bin/sh
set -e

if [ "${SKIP_MIGRATIONS:-0}" != "1" ]; then
  echo "Applying database migrations..."
  cd /app/migrator
  node node_modules/prisma/build/index.js migrate deploy
  cd /app
fi

exec node server.js
