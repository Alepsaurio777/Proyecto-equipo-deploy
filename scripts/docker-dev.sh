#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado. Instala Docker antes de continuar." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker no está corriendo. Inicia el daemon de Docker." >&2
  exit 1
fi

echo "Preparando entorno..."
if [ -f .env ]; then
  echo ".env ya existe, no se sobreescribe."
elif [ -f .env.example ]; then
  cp .env.example .env
  echo "Copiado .env.example -> .env"
else
  echo "No se encontró .env.example. Crea .env manualmente si es necesario."
fi


MODE="${1:-dev}"
if [ "$MODE" = "prod" ]; then
  echo "Construyendo y levantando contenedores para PRODUCCIÓN..."
  docker compose build frontend_prod api
  docker compose up -d db api frontend_prod phpmyadmin
  echo "Contenedores (producción) levantados."
  echo "Front-end (prod): http://localhost"
  echo "API (PHP): http://localhost:8080"
  echo "phpMyAdmin: http://localhost:8081"
else
  echo "Levantando contenedores (desarrollo) (docker compose up --build -d)..."
  docker compose up --build -d
  echo "Contenedores levantados. Estado:"
  docker compose ps

  echo "
  Front-end (dev): http://localhost:3000
  API (PHP): http://localhost:8080 (endpoints en api/*.php)
  MySQL: puerto 3306 (root/root)
  phpMyAdmin: http://localhost:8081
  "

  echo "Para ver logs: docker compose logs -f"
fi

exit 0
