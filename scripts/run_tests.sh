#!/usr/bin/env bash
# ==============================================================================
# Script de Ejecución del Harness de Pruebas Automatizadas (P01 - P18)
# ==============================================================================

set -e

echo "=========================================================="
echo " Ejecutando Suite de Pruebas Automatizadas (P01 - P18)..."
echo "=========================================================="

if command -v docker &> /dev/null && docker compose ps &> /dev/null; then
  echo "Ejecutando dentro del contenedor 'catalogo-backend'..."
  docker compose exec -T backend npm test
else
  echo "Ejecutando localmente en backend..."
  cd backend && npm test
fi

echo "=========================================================="
echo " Ejecución de pruebas completada exitosamente."
echo "=========================================================="
