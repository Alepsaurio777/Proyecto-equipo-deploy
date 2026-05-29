SHELL := /bin/bash

.PHONY: dev up down logs build-prod prod-up prod-down

dev:
	chmod +x scripts/docker-dev.sh || true
	./scripts/docker-dev.sh

up:
	docker compose up --build -d

down:
	docker compose down -v

logs:
	docker compose logs -f

build-prod:
	docker compose build frontend_prod api

prod-up: build-prod
	docker compose up -d db api frontend_prod phpmyadmin

prod-down:
	docker compose down -v
