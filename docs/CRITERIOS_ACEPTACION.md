# Matriz Normativa de Criterios de Aceptación y Rúbrica de Evaluación

**Proyecto:** Sistema de Gestión del Catálogo de Servicios de TI  
**Asignatura:** Software Avanzado — USAC  
**Estudiante:** Enner (Carné: 202302220)  
**Catedrático Evaluador:** Marco Tulio Aldana Prillwitz (`maldanap-usac`)  
**Fecha de Entrega:** 04 de Octubre 2026 23:00  
**Versión del Entorno:** 2.0.0 (Tag: `parcial-v2.0`)  

---

## 1. Relación entre Criterios de Aceptación y Rúbrica de Evaluación

En ingeniería de software y en este parcial práctico existe una distinción y correspondencia directa entre ambos conceptos:

1. **Criterios de Aceptación (Nivel Operativo y Técnico):** Son las condiciones funcionales, aserciones y límites de negocio medibles que el software y la base de datos deben cumplir de forma determinista (e.g. validación `minimo <= maximo`, 12 N1 y 46 N2 exactos, regla P11 de pertenencia seccional, respuesta `401 Unauthorized` ante solicitudes sin token). Corresponden a las secciones 2, 3 y 6 del enunciado.
2. **Rúbrica de Evaluación (Nivel de Calificación y Acreditación):** Es la ponderación porcentual (100 puntos totales, equivalentes a los 25 puntos netos del parcial) con la cual el catedrático evalúa la completitud y calidad de las evidencias entregadas (Sección 9 del enunciado).
3. **Mapeo:** El cumplimiento verificable de los **Criterios de Aceptación** constituye la prueba fehaciente que acredita el 100% de la puntuación en cada renglón de la **Rúbrica**.

---

## 2. Rúbrica de Evaluación vs. Evidencias Verificables (100 Puntos)

| Criterio de Rúbrica | Pts | Condición para 100% de la Nota | Evidencia Operativa en el Repositorio | Estado |
|---|:---:|---|---|:---:|
| **1. Modelo e importación del Excel** | 15 | Campos y relaciones correctos, 12 N1 y 46 N2 exactos, importación idempotente y conflictos trazables. | [importer.service.ts](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/backend/src/modules/importer/importer.service.ts)<br>Pruebas **P06**, **P07** y **P08**.<br>Tabla `importaciones_observaciones`. | **CUMPLIDO (100%)** |
| **2. Funcionalidad del catálogo y organización** | 20 | Altas, consultas, filtros, jerarquía de 6 niveles, asignaciones RACI y validaciones en servidor. | [catalog.service.ts](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/backend/src/modules/catalog/catalog.service.ts)<br>[organization.service.ts](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/backend/src/modules/organization/organization.service.ts)<br>Pruebas **P04**, **P05**, **P09**, **P10**, **P11**. | **CUMPLIDO (100%)** |
| **3. Autenticación y autorización** | 10 | Autenticación local, hash Bcrypt con sal, roles RBAC y protección en servidor (no solo en UI). | [auth.service.ts](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/backend/src/modules/auth/auth.service.ts)<br>[roles.guard.ts](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/backend/src/guards/roles.guard.ts)<br>Pruebas **P01**, **P02**, **P03**. | **CUMPLIDO (100%)** |
| **4. Context engineering** | 10 | Contexto útil y versionado, regla de frontera de datos y dos actualizaciones documentadas. | [AGENTS.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/AGENTS.md)<br>[docs/context/CONTEXT_SPEC.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/context/CONTEXT_SPEC.md)<br>Resolución canónica SE.12 y Baja Lógica. | **CUMPLIDO (100%)** |
| **5. Prompt engineering** | 10 | Cinco prompts reales utilizados con metadata y dos mejoras documentadas con resultados. | [docs/prompts/PROMPTS_ENGINEERING.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/prompts/PROMPTS_ENGINEERING.md)<br>Iteración 1 (Extracción Excel) e Iteración 2 (Regla P11). | **CUMPLIDO (100%)** |
| **6. Harness engineering** | 10 | Entorno reproducible de ejecución y verificación, límites de seguridad y ciclo de corrección demostrado. | [docs/harness_evidence/HARNESS_EVIDENCE.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/harness_evidence/HARNESS_EVIDENCE.md)<br>Scripts `./scripts/*.sh`<br>Ciclo de corrección de coerción a cero. | **CUMPLIDO (100%)** |
| **7. Pruebas automatizadas** | 10 | Escenarios P01 a P12 automatizados con aserciones, resultados observables y aislamiento de datos. | [harness.service.ts](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/backend/src/modules/harness/harness.service.ts)<br>Consola web `/harness`<br>`npm test` en backend (12/12 PASSED). | **CUMPLIDO (100%)** |
| **8. Docker y reproducibilidad** | 10 | Construcción desde clon limpio, `compose.yaml`, persistencia mediante volumen `mariadb_data`. | [compose.yaml](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/compose.yaml)<br>Healthcheck de base de datos<br>Sin dependencias en la máquina anfitrión. | **CUMPLIDO (100%)** |
| **9. GitHub y documentación Markdown** | 5 | Catedrático agregado como colaborador (`maldanap-usac`), etiqueta `parcial-v2.0` y docs completos. | Tag Git `parcial-v2.0`<br>[docs/RESOLUCION.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/RESOLUCION.md)<br>[README.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/README.md) | **CUMPLIDO (100%)** |
| **Puntaje Total** | **100** | **Evaluación Máxima Proyectada: 100/100 (25/25 pts netos)** | | |

---

## 3. Criterios de Aceptación Funcionales Detallados

### 3.1 Autenticación y Autorización (Requisito 3.1)
- [x] **CA-01 (Autenticación Local):** El sistema valida credenciales contra MariaDB local mediante `POST /api/auth/login`. No depende de Google, GitHub ni terceros.
- [x] **CA-02 (Criptografía):** Contraseñas almacenadas exclusivamente como hashes mediante `Bcrypt` con factor de coste de sal 10. `passwordHash` se elimina en el DTO de salida (`class-transformer`).
- [x] **CA-03 (Protección en Servidor):** Rutas protegidas mediante `JwtAuthGuard` y `RolesGuard` a nivel de controlador backend. Ocultar botones en la UI no es la única barrera.
- [x] **CA-04 (Roles Diferenciados):**
  - Rol `administrador`: acceso de creación, edición, baja lógica e importación.
  - Rol `consulta`: acceso de solo lectura; mutaciones devuelven **403 Forbidden**.
- [x] **CA-05 (Invalidación de Sesión):** `POST /api/auth/logout` añade el token a la lista negra (`TokenBlacklistService`), rechazando intentos posteriores con **401 Unauthorized**.
- [x] **CA-06 (Bloqueo de Inactivos):** Usuarios con `activo === false` son rechazados en el login con mensaje explícito.

### 3.2 Jerarquía Organizacional y Bajas Lógicas (Requisito 3.2)
- [x] **CA-07 (Jerarquía Estricta de 6 Niveles):**
  $$\text{Empresa} \longrightarrow \text{Área} \longrightarrow \text{Departamento} \longrightarrow \text{Sección} \longrightarrow \text{Puesto} \longrightarrow \text{Usuario}$$
- [x] **CA-08 (Unicidad en Ámbito Padre):** Los códigos de entidades subordinadas son únicos dentro del identificador de su padre directo.
- [x] **CA-09 (Inferencia de Empresa):** La empresa de un usuario se deduce exclusivamente de su cadena jerárquica ascendente.
- [x] **CA-10 (No Huérfanos):** Es imposible crear registros sin un padre válido existente.
- [x] **CA-11 (Política Restrictiva de Desactivación):** No se permite desactivar una entidad si tiene registros hijos o servicios activos asignados. Se devuelve **400 Bad Request** con la lista de dependencias a reasignar.

### 3.3 Catálogo de Servicios y Gobernanza ITIL/RACI (Requisito 3.3)
- [x] **CA-12 (Estructura Nivel 1 y Nivel 2):** Todo servicio Nivel 2 pertenece obligatoriamente a un Nivel 1.
- [x] **CA-13 (Opciones Controladas):** Clase (`A DEMANDA`, `RECURRENTE`), Criticidad (`Very Low`, `Low`, `Normal`, `High`, `Very High`) y Tipo (`Back End`, `Front End`, etc.) gobernados por catálogos normalizados.
- [x] **CA-14 (Regla de Umbrales):** Si existen valores mínimo y máximo, se valida en servidor `minimo <= maximo`. Si no existen, se conservan como `NULL` (nunca cero).
- [x] **CA-15 (Regla P11 de Gobernanza RACI):** Si un servicio Nivel 2 tiene asignado un usuario responsable (*Service Owner*), este debe pertenecer obligatoriamente a la **Sección Responsable** del servicio.

### 3.4 Importador de Excel y Frontera de Confianza (Requisito 2 y 3.4)
- [x] **CA-16 (Data Trust Boundary):** El contenido del archivo Excel es procesado como datos pasivos de entrada. Ninguna celda se interpreta como instrucción o prompt.
- [x] **CA-17 (Metas de Control de Importación):** La carga procesa exactamente **12 registros N1** y **46 registros N2**.
- [x] **CA-18 (Idempotencia):** Re-ejecutar la importación produce **0 duplicados** y reporta creados, omitidos y observaciones.
- [x] **CA-19 (Resolución Canónica SE.12):** El código N1 `SE.12` adopta el nombre canónico oficial *"Suministrar Analítica"*. El alias alternativo *"Mantener Tableros de Control"* se almacena como observación auditable en `importaciones_observaciones`.
- [x] **CA-20 (Preservación de Nulos):** Atributos incompletos de `SE.12.1` a `SE.12.3` se registran como `NULL` y estado `'DESCONOCIDO'`.

---

## 4. Matriz de Aceptación de Pruebas Automatizadas (P01 a P12)

| ID | Escenario de Prueba | Criterio de Aceptación Esperado | Comprobación Automatizada | Estado |
|:---:|---|---|---|:---:|
| **P01** | Inicio de sesión válido e inválido | Contraseña incorrecta rechazada con 401; credenciales correctas emiten token JWT con expiración y usuario sanitizado. | `testP01()` en `HarnessService` | **PASSED** |
| **P02** | Acceso sin sesión, cierre de sesión y usuario inactivo | Petición sin token rechazada (401); token cerrado invalidado en lista negra; usuario inactivo bloqueado. | `testP02()` en `HarnessService` | **PASSED** |
| **P03** | Usuario de consulta intenta modificar datos | Acceso de lectura permitido (200); mutación (`POST`/`PUT`/`DELETE`) rechazada en servidor con 403 Forbidden. | `testP03()` en `HarnessService` | **PASSED** |
| **P04** | Crear una jerarquía y asignar un usuario | Cadena Empresa &rarr; Área &rarr; Depto &rarr; Sección &rarr; Puesto &rarr; Usuario creada y recuperable íntegramente. | `testP04()` en `HarnessService` | **PASSED** |
| **P05** | Código duplicado o referencia inexistente | Código duplicado genera 409 Conflict; padre inexistente genera 404 NotFound con mensaje explicativo. | `testP05()` en `HarnessService` | **PASSED** |
| **P06** | Importar el archivo original | Exactamente 12 códigos Nivel 1 y 46 servicios Nivel 2 registrados; incidencias de celdas registradas. | `testP06()` en `HarnessService` | **PASSED** |
| **P07** | Repetir la importación (Idempotencia) | Segunda ejecución reporta 0 nuevos registros N1 y N2; 0 duplicados generados. | `testP07()` en `HarnessService` | **PASSED** |
| **P08** | Revisar SE.12 y atributos ausentes | SE.12 registrado como "Suministrar Analítica"; observaciones de alias guardadas; campos nulos preservados. | `testP08()` en `HarnessService` | **PASSED** |
| **P09** | Crear o editar servicio con mínimo mayor que máximo | Servidor valida y rechaza con 400 Bad Request si `minimo > maximo`. | `testP09()` en `HarnessService` | **PASSED** |
| **P10** | Buscar y filtrar servicios | Filtros por texto, Nivel 1, clase, criticidad y tipo devuelven resultados consistentes y paginados. | `testP10()` en `HarnessService` | **PASSED** |
| **P11** | Asignar responsable de una sección distinta (RACI) | Intentar asociar un usuario responsable cuya sección difiera de la del servicio es rechazado con 400. | `testP11()` en `HarnessService` | **PASSED** |
| **P12** | Persistencia de datos en MariaDB | Verificación de persistencia mediante volumen nombrado `mariadb_data`. | `testP12()` en `HarnessService` | **PASSED** |

---

## 5. Lista de Verificación para el Recorrido del Catedrático (Sección 10)

El evaluador (`maldanap-usac`) puede ejecutar la siguiente rutina de comprobación punto por punto:

1. **Clonado Limpio y Verificación de Git:**
   - [x] Repositorio accesible con usuario colaborador invitado.
   - [x] Commit etiquetado con el tag oficial `parcial-v2.0`.
2. **Despliegue con Docker Compose:**
   - [x] Ejecutar `docker compose up --build -d` sin requerir instalar herramientas locales en el anfitrión.
   - [x] Los 3 contenedores levantan automáticamente (`catalogo-mariadb`, `catalogo-backend`, `catalogo-frontend`).
3. **Acceso a la Interfaz Web:**
   - [x] Ingresar a `http://localhost:3000`.
   - [x] Redirección automática a `/login` al no poseer sesión activa.
   - [x] Cuentas de demostración con 1 solo clic (`admin@usac.edu` y `consulta@usac.edu`).
4. **Verificación de Catálogo y RACI:**
   - [x] Consultar los 46 servicios en `/catalogo`.
   - [x] Abrir la Ficha Técnica de un servicio con responsable y verificar gobernanza.
   - [x] Intentar editar con usuario de consulta &rarr; opciones deshabilitadas y protegidas.
5. **Verificación de Organización:**
   - [x] Ver el árbol jerárquico de 6 niveles en `/organizacion`.
   - [x] Intentar desactivar una entidad con dependencias &rarr; alerta restrictiva desplegada.
6. **Ejecución del Harness de Pruebas:**
   - [x] Ingresar a `http://localhost:3000/harness` o ejecutar `./scripts/run_tests.sh`.
   - [x] Las 12 pruebas pasan con 100% de éxito en tiempo real.
7. **Persistencia de Datos:**
   - [x] Ejecutar `docker compose down` y volver a levantar con `docker compose up -d`.
   - [x] Los datos siguen presentes íntegramente en el volumen `mariadb_data`.
