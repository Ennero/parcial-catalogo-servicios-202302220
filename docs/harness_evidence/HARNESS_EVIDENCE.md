# Evidencia de Harness Engineering — Ciclos de Control y Verificación

**Asignatura:** Software Avanzado — USAC  
**Estudiante:** Enner (Carné: 202302220)  
**Catedrático Evaluador:** Marco Tulio Aldana Prillwitz (`maldanap-usac`)  
**Fecha:** 2026-09-30  

---

## 1. Definición del Harness en este Proyecto

Para este proyecto, el harness de ingeniería se compone de:
1. **Entorno Contenedorizado de Ejecución:** Orquestado por `compose.yaml`, asegurando que el sistema ejecute idénticamente en la máquina del estudiante y en la del catedrático, sin exigir la instalación de MariaDB, Node.js ni herramientas externas en el anfitrión.
2. **Scripts de Automatización:**
   - `./scripts/run_tests.sh`: Ejecuta la batería de pruebas P01 a P12 retornando código de salida `0` en éxito o `!= 0` en fallo.
   - `./scripts/harness.sh`: Orquesta la verificación de estado de contenedores, importación de catálogo y ejecución de la suite.
   - `./scripts/seed.sh` e `./scripts/import.sh`: Inicialización controlada de datos de evaluación.
3. **Panel Web de Monitoreo:** Vista en Next.js (`/harness`) que permite a los evaluadores inspeccionar el estado de los 12 escenarios de prueba, ejecutarlos en vivo con un clic y examinar tiempos de respuesta y detalles de aserción.

---

## 2. Límites Operativos de Seguridad (Guardrails)

- **Protección de Secretos:** No se incluyen claves privadas ni contraseñas reales en Git. El archivo `.env.example` contiene únicamente valores de demostración local.
- **Inmutabilidad del Archivo Fuente:** `data/CatalogoServicios.xlsx` y `docs/CatalogoServicios.xlsx` están montados como volúmenes de solo lectura (`:ro`) en Docker, impidiendo cualquier alteración accidental o deliberada.
- **Aislamiento de Pruebas:** Las pruebas crean registros con prefijos de prueba temporales (`TEST-...`) sin alterar ni destruir los datos precargados para la evaluación del catedrático.

---

## 3. Demostración del Ciclo Completo de Detección y Corrección (Failure -> Fix -> Pass)

### Paso 1: Tarea
Implementar la validación y carga de umbrales `mínimo` y `máximo` del Excel y del formulario web, cumpliendo con la directriz:
*"Cuando existan mínimo y máximo, validar mínimo ≤ máximo. Un dato ausente no debe convertirse automáticamente en cero."*

### Paso 2: Cambio Propuesto Inicial (Fallo Introducido)
En la primera versión del importador y de la entidad, las columnas vacías de mínimo y máximo se parseaban con `parseFloat(val) || 0`, lo que convertía los valores nulos en `0`.

### Paso 3: Ejecución de Controles del Harness (Fallo Detectado)
Al ejecutar el escenario de prueba **P08** ("Revisar SE.12 y atributos ausentes"):
```text
FAIL src/modules/harness/harness.spec.ts
  ● Suite de Pruebas Automatizadas del Harness (P01 - P12) › Debe ejecutar y verificar los 12 escenarios
    Error: Los atributos ausentes de SE.12.1 fueron sustituidos con datos inventados o coerción a cero.
    Expected: null
    Received: 0
```
El harness abortó la ejecución con código de salida `1`, impidiendo que el fallo pasara inadvertido.

### Paso 4: Corrección Aplicada
Se refactorizó la función `parseNumber` en `ImporterService` y en `CatalogService`:
```typescript
const parseNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return isNaN(num) ? null : num;
};
```
Se ajustó la validación para que solo evalúe `minimo <= maximo` cuando ambos campos son distintos de `null` y `undefined`.

### Paso 5: Nueva Ejecución Satisfactoria
Se ejecutó nuevamente el harness:
```text
PASS src/modules/harness/harness.spec.ts
  ✅ [P08] Revisar SE.12 y atributos ausentes (15ms)
      Detalles: Nombre canónico 'Suministrar Analítica' aplicado para SE.12; alias registrado; atributos ausentes conservados como NULL.
  
  Total: 12 | Aprobados: 12 | Fallidos: 0 | Tasa de Éxito: 100%
  Código de salida: 0 (Éxito)
```
El ciclo quedó cerrado, validado y registrado en la bitácora de evidencias.
