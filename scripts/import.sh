#!/usr/bin/env bash
# Script para ejecutar importador de catálogo Excel en Docker
docker compose exec -T backend npm run import-excel
