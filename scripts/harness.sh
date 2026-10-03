#!/usr/bin/env bash
# ==============================================================================
# Script Maestro del Harness: Verificación, Preparación y Pruebas
# ==============================================================================

set -e

echo "1. Verificando estado de contenedores Docker..."
docker compose ps

echo "2. Ejecutando verificación de esquema e importación del catálogo..."
docker compose exec -T backend npm run import-excel

echo "3. Ejecutando batería de pruebas unitarias y de integración P01 a P12..."
docker compose exec -T backend npm test

echo "Harness ejecutado con código de salida 0 (Éxito)."
