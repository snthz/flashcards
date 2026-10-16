#!/bin/sh
set -eu

IMAGE="${1:-flashcards:ci}"
HOST_PORT="${HOST_PORT:-3000}"
SESSION_SECRET="${SESSION_SECRET:-smoke-test-session-secret-0123456789abcdef}"
CONTAINER="flashcards-smoke-$$"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required (use host.docker.internal as the host for a database on the host)" >&2
  exit 1
fi

cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    echo "--- container logs ---" >&2
    docker logs "$CONTAINER" >&2 2>&1 || true
  fi
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d --name "$CONTAINER" \
  --add-host=host.docker.internal:host-gateway \
  -p "$HOST_PORT:3000" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SESSION_SECRET="$SESSION_SECRET" \
  "$IMAGE" >/dev/null

attempt=0
while [ "$attempt" -lt 60 ]; do
  if [ -z "$(docker ps -q -f "name=$CONTAINER")" ]; then
    echo "container exited before becoming healthy" >&2
    exit 1
  fi
  if body=$(curl -fsS --max-time 5 "http://127.0.0.1:$HOST_PORT/api/health" 2>/dev/null); then
    echo "$body"
    for path in / /login /register; do
      curl -fsS -o /dev/null --max-time 15 "http://127.0.0.1:$HOST_PORT$path"
      echo "ok $path"
    done
    exit 0
  fi
  attempt=$((attempt + 1))
  sleep 2
done

echo "health endpoint did not respond in time" >&2
exit 1
