# PRUEBAS.md — Matriz de Trazabilidad, Verificación y Resultados de Pruebas P01 a P18

**Proyecto:** Sistema de Service Desk y Gestión de CMDB con IA Asistida  
**Asignatura:** Software Avanzado — USAC  
**Estudiante:** Enner (Carné: 202302220)  
**Catedrático Evaluador:** Marco Tulio Aldana Prillwitz (`maldanap-usac`)  
**Versión:** 3.0.0  
**Fecha:** Octubre 2026  

---

## 1. Matriz General de Trazabilidad (Requisito $\longrightarrow$ Implementación $\longrightarrow$ Prueba $\longrightarrow$ Evidencia)

| Requisito Enunciado | Componente / Archivo de Implementación | Endpoint / Método | Escenario de Prueba | Evidencia / Resultado Observado |
| :--- | :--- | :--- | :---: | :--- |
| **Sec. 3: Autenticación, Inactivos y RBAC** | `auth.service.ts`, `roles.guard.ts` | `POST /api/auth/login` | **P01** | Token JWT emitido para roles válidos; HTTP 401 para credenciales erróneas o usuario inactivo; HTTP 403 ante falta de permisos. |
| **Sec. 3: Importador Idempotente Catálogo** | `importer.service.ts` | `POST /api/importer/import` | **P02** | Exactamente 12 N1 y 46 N2 importados. Re-ejecución produce 0 duplicados y log de incidencias. |
| **Sec. 8: 5,000 CIs Sintéticos y Semilla** | `cmdb.service.ts` | `POST /api/cmdb/generar-sinteticos` | **P03** | 5,000 CIs generados con semilla `202302220`. IPs asignadas condicionalmente. Re-ejecución idempotente. |
| **Sec. 8: Taxonomía CMDB y Anti-ciclos** | `cmdb.service.ts` | `POST /api/cmdb/categorias` | **P04** | Árbol de 4 niveles validado. Rechazo de padre inexistente y detección de ciclos en categorías. |
| **Sec. 4: Creación de Tickets y Validaciones** | `ticket.service.ts` | `POST /api/tickets` | **P05** | Creación exitosa de tickets vinculados a N2, N1 y CIs. Tickets sin CI aceptados con justificación textual obligatoria. |
| **Sec. 5: Colas, RBAC y Protección Consulta** | `queue.service.ts`, `queue.controller.ts` | `POST /api/queues/:id/usuarios` | **P06** | Rol `consulta` no eleva privilegios. Asignación a colas respetada. Servidor rechaza operaciones no autorizadas. |
| **Sec. 5: Concurrencia al Tomar Tickets** | `ticket.service.ts` | `POST /api/tickets/:id/tomar` | **P07** | Actualización atómica SQL: 1 agente toma el ticket (HTTP 200), 2do agente recibe HTTP 409 Conflict. |
| **Sec. 5: Transferencia entre Colas** | `ticket.service.ts` | `POST /api/tickets/:id/transferir` | **P08** | Transferencia validada por compatibilidad de proceso. Actor, fecha, motivo y colas asentados en bitácora. |
| **Sec. 6: 7 Procesos ITIL y Transiciones** | `ticket.service.ts` | `PATCH /api/tickets/:id/estado` | **P09** | Máquina de estados validada para cada proceso. Transición inválida rechazada con HTTP 400 Bad Request. |
| **Sec. 6: Seguridad RFC y No Autoaprobación** | `ticket.service.ts` | `PATCH /api/tickets/:id/estado` | **P10** | RFC rechaza pasar a `ejecucion` sin aprobación CAB. Solicitud de acceso rechaza autoaprobación (`solicitante === aprobador`). |
| **Sec. 7: Eventos E0–E3 y Vinculación Incidente**| `ticket.service.ts` | `POST /api/tickets` (Evento E2/E3) | **P11** | Eventos E2 y E3 disparan generación o vinculación automática de incidente sin duplicarlo al reprocesar. |
| **Sec. 7: Incidentes I0–I6 y Tiempos** | `ticket.service.ts` | `POST /api/tickets` (Incidente) | **P12** | Categorías I0 a I6 registradas con coherencia de duración estimada/real, prioridad y redundancia. |
| **Sec. 6: Relación Incidente $\rightarrow$ Problema $\rightarrow$ RFC** | `ticket.service.ts` | `POST /api/tickets/:id/relaciones` | **P13** | Vinculación bidireccional entre tickets. Causa raíz y cambio correctivo trazables en el grafo de tickets. |
| **Sec. 8: Recorrido Grafo CI y Dependencias** | `cmdb.service.ts` | `GET /api/cmdb/cis/:id/impacto` | **P14** | Cálculo de *blast radius* BFS aguas abajo. Anillos en `conectado_a` permitidos; ciclos en `depende_de` rechazados. |
| **Sec. 4: Cierre con Solución y Reapertura** | `ticket.service.ts` | `PATCH /api/tickets/:id/estado` | **P15** | Bloqueo de cierre/resolución sin texto en `solucionAplicada`. Reapertura permitida con registro en bitácora. |
| **Sec. 8: Búsqueda y Paginación 5,000 CIs** | `cmdb.service.ts` | `GET /api/cmdb/cis` | **P16** | Búsqueda por texto y filtros paginados sobre 5,000 registros con tiempo de respuesta $< 150\text{ ms}$. |
| **Sec. 7: Indicadores SLA y Tratamiento Pausas** | `ticket.service.ts` | `GET /api/tickets/dashboard` | **P17** | Métricas de TPA, TR y porcentaje de cumplimiento de SLA en tiempo calendario continuo sin sesgos. |
| **Sec. 10: Persistencia de Datos tras Reinicio** | Docker Compose / Volumen MariaDB | N/A (Docker Restart) | **P18** | Reinicio completo de contenedores (`docker compose down` y `up`). Catálogo, CIs, tickets y bitácoras intactos. |

---

## 2. Detalle de Ejecución de Cada Escenario (P01 a P18)

### P01. Autenticación, Cierre de Sesión, Inactivos y Rechazo de Operaciones sin Permiso
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P01' }`
- **Entrada:**
  1. Login con credenciales válidas: `admin@usac.edu` / `Admin123!*`
  2. Login con usuario inactivo: `inactivo@usac.edu`
  3. Petición autenticada como usuario con rol `solicitante` hacia endpoint restringido `POST /api/queues`.
- **Resultado Esperado:** 
  1. Retorno de Token JWT con claims de usuario y roles.
  2. Retorno `HTTP 401 Unauthorized` indicando cuenta inactiva.
  3. Retorno `HTTP 403 Forbidden` indicando permisos insuficientes.
- **Resultado Obtenido:** Conforme. Tokens emitidos con firma válida, usuario inactivo rechazado y RBAC validado en servidor.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P02. Importación Repetible del Catálogo: Controles 12/46 e Incidencias Conservadas
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P02' }`
- **Entrada:** Ejecución secuencial doble del motor de importación sobre `CatalogoServicios.xlsx`.
- **Resultado Esperado:** 
  1. Primera ejecución: Exactamente 12 servicios N1 y 46 servicios N2 creados.
  2. Segunda ejecución: 0 registros duplicados, 58 actualizados/conservados. Registro canónico de `SE.12` como `"Suministrar Analítica"` con observación en log.
- **Resultado Obtenido:** Conforme. 12 N1 y 46 N2 confirmados en MariaDB. Conflicto SE.12 trazado en auditoría.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P03. Carga de al Menos 5,000 Dispositivos Únicos y Repetición sin Duplicados
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P03' }`
- **Entrada:** Generación sintética con semilla `202302220` (cantidad solicitada: 5,000). Segunda invocación con los mismos parámetros.
- **Resultado Esperado:** Conteo de CIs $\ge 5,000$ tras la primera ejecución; re-ejecución reporta 0 duplicados añadidos; dispositivos pasivos conservan `direccionIp: null`.
- **Resultado Obtenido:** Conforme. 5,000 CIs únicos generados. Inserción idempotente verificada. 2,155 CIs sin IP asignada.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P04. Correspondencia de Jerarquía CMDB, Excel y Lección 22; Rechazo de Padres Inexistentes y Ciclos
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P04' }`
- **Entrada:**
  1. Verificación de categorías base sembradas (Servidores, Redes, Almacenamiento, Software).
  2. Intento de crear categoría con `parentId` inexistente (`UUID` aleatorio).
  3. Intento de crear ciclo jerárquico asignando a un padre su propio hijo como padre.
- **Resultado Esperado:** Categorías existentes corresponden a CMDB.xlsx. Respuestas `HTTP 400 Bad Request` en los casos inválidos.
- **Resultado Obtenido:** Conforme. Integridad jerárquica preservada y errores 400 emitidos correctamente.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P05. Creación de Tickets con Referencias Válidas y Rechazo de Referencias Inválidas
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P05' }`
- **Entrada:**
  1. Creación de ticket con Servicio N2 válido y CI válido.
  2. Creación de ticket sin CI con justificación textual: `"Consulta general de procedimiento"`.
  3. Creación de ticket sin CI sin justificación textual.
  4. Creación de ticket con Servicio N2 inexistente.
- **Resultado Esperado:** Casos 1 y 2 creados con HTTP 201; casos 3 y 4 rechazados con HTTP 400.
- **Resultado Obtenido:** Conforme. Validaciones en servidor ejecutadas exitosamente.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P06. Asignación de Cola a Roles y Usuarios; Acceso Permitido y Denegado según Política
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P06' }`
- **Entrada:**
  1. Usuario con rol `agente` toma un ticket de una cola donde tiene `puedeAtender: true`.
  2. Usuario con rol `consulta` asignado a la cola intenta ejecutar acción de atención o cambio de estado.
- **Resultado Esperado:** Acción del agente autorizada (HTTP 200); acción del usuario de consulta denegada (HTTP 403 Forbidden).
- **Resultado Obtenido:** Conforme. Banderas de cola respetadas y rol `consulta` protegido de elevación no autorizada.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P07. Ordenamiento Reproducible y Dos Agentes Intentando Tomar el Mismo Ticket Concurrente
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P07' }`
- **Entrada:** Disparo concurrente asíncrono (`Promise.allSettled`) de dos agentes intentando reclamar el mismo ticket nuevo.
- **Resultado Esperado:** 
  - Exactamente un agente recibe `HTTP 200 OK` y es asignado como responsable.
  - El segundo agente recibe `HTTP 409 Conflict: "El ticket ya fue tomado por otro agente."`
  - La cola presenta los tickets ordenados por prioridad descendente y fecha de creación ascendente.
- **Resultado Obtenido:** Conforme. Atomicidad verificada a nivel de MariaDB sin colisiones.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P08. Transferencia entre Colas con Historial y Validación del Proceso Destino
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P08' }`
- **Entrada:** Transferencia de un ticket de la cola `COLA-INCI` hacia otra cola compatible, enviando motivo: `"Escalamiento por especialidad técnica a soporte N2"`.
- **Resultado Esperado:** Ticket actualizado con nueva cola; registro en `tickets_bitacora` con fecha, actor, cola anterior, cola nueva y motivo.
- **Resultado Obtenido:** Conforme. Historial de transferencia verificado en auditoría.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P09. Ejecución de Ruta Completa de los Siete Procesos y Rechazo de Transiciones Inválidas
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P09' }`
- **Entrada:** Ejecución de ciclo de estados en cada uno de los 7 procesos (Nuevos Servicios, Cambios, Incidentes, Eventos, Problemas, Accesos, Servicios TI). Intento de salto ilegal de `nuevo` a `cerrado` directamente.
- **Resultado Esperado:** Transiciones válidas avanzan según la máquina de estados; transición ilegal rechazada con HTTP 400.
- **Resultado Obtenido:** Conforme. Flujos independientes y guardas operativas verificadas.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P10. Cambio sin Aprobación y Acceso Autoaprobado: Operaciones Rechazadas
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P10' }`
- **Entrada:**
  1. Intento de pasar un ticket de cambio (RFC) a estado `ejecucion` cuando se encuentra en `nuevo` o `analisis` sin pasar por `aprobado`.
  2. Intento del solicitante de un ticket de acceso de emitir la aprobación él mismo (`solicitanteId === aprobadorId`).
- **Resultado Esperado:** Ambas operaciones son rechazadas con `HTTP 400 Bad Request` con mensajes descriptivos.
- **Resultado Obtenido:** Conforme. Segregación de funciones e integridad de CAB comprobadas.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P11. Eventos E0–E3 con Respuesta Correspondiente; E2/E3 Vinculados a Incidentes sin Duplicarlos
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P11' }`
- **Entrada:** Creación de evento E0 (informativo), E1 (sin impacto), E2 (con impacto) y E3 (seguridad). Reprocesamiento del evento E2.
- **Resultado Esperado:** E0 y E1 registrados sin incidente; E2 y E3 generan automáticamente ticket de incidente vinculado; re-evaluación no crea un segundo incidente.
- **Resultado Obtenido:** Conforme. Incidentes creados e idempotencia comprobada.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P12. Registro I0–I6 y Validación de Reglas Complementarias de Duración, Prioridad y Redundancia
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P12' }`
- **Entrada:** Creación de incidentes con clasificaciones I0 a I6 y asignación de rangos de duración estimada.
- **Resultado Esperado:** Correspondencia con rótulos de Diapositiva 16; validación de coherencia entre duración estimada y categoría asignada.
- **Resultado Obtenido:** Conforme. Las 7 categorías I0-I6 registradas con sus atributos de redundancia y prioridad.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P13. Incidente Vinculado a Problema y Cambio, con Trazabilidad Recuperable
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P13' }`
- **Entrada:** Creación de un incidente `TICK-INC-01`, vinculación a un problema `TICK-PROB-01` (`incidente_de_problema`), y vinculación del problema a un cambio RFC `TICK-RFC-01` (`cambio_de_problema`).
- **Resultado Esperado:** Consulta de relaciones del problema recupera tanto el incidente origen como el cambio correctivo.
- **Resultado Obtenido:** Conforme. Grafo relacional de tickets completamente navegable.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P14. Recorrido CI–Servicio y Manejo de Ciclos según Tipo de Relación
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P14' }`
- **Entrada:**
  1. Creación de relaciones `conectado_a` en anillo entre switches.
  2. Intento de crear ciclo dirigido en `depende_de` (A depende de B y B depende de A).
  3. Cálculo de impacto aguas abajo desde un switch hasta los servicios N2 asociados.
- **Resultado Esperado:** Anillo en `conectado_a` aceptado; ciclo en `depende_de` rechazado con HTTP 400; lista de servicios impactados retornada.
- **Resultado Obtenido:** Conforme. Discriminación semántica de tipos de arista verificada.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P15. Cierre sin Resolución, Reapertura y Bitácora: Reglas Aplicadas y Actor Registrado
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P15' }`
- **Entrada:**
  1. Intento de cambiar estado a `resuelto` sin proporcionar `solucionAplicada`.
  2. Cierre regular con solución y posterior reapertura de ticket resuelto enviando motivo.
- **Resultado Esperado:** Paso 1 rechazado con HTTP 400; paso 2 exitoso con estado `reabierto` y registro del actor en bitácora.
- **Resultado Obtenido:** Conforme. Solución obligatoria validada y bitácora inmutable auditada.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P16. Filtros y Paginación con 5,000 Dispositivos: Tiempos Observados y Entorno de Prueba
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P16' }`
- **Entrada:** Consulta paginada `GET /api/cmdb/cis?limite=10&pagina=1&categoria=Servidores` sobre el conjunto de 5,000 CIs.
- **Resultado Esperado:** Retorno de exactamente 10 CIs con metadatos de paginación total en tiempo $< 150\text{ ms}$.
- **Resultado Obtenido:** Conforme. Tiempo observado en entorno local Docker: **$42\text{ ms}$** (promedio de 5 ejecuciones).
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P17. Indicadores con Datos Controlados, Incluidas Pausas y Tickets Aún Abiertos
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P17' }`
- **Entrada:** Invocación de `GET /api/tickets/dashboard` sobre el conjunto sembrado de 35 tickets de prueba.
- **Resultado Esperado:** Métricas de TPA (tiempo de primera atención), TR (tiempo de resolución) y porcentaje de SLA calculados en tiempo continuo 24/7 sin arrojar valores NaN ni divisiones por cero.
- **Resultado Obtenido:** Conforme. Indicadores calculados coherentemente para tickets resueltos y en curso.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`

---

### P18. Reinicio de Contenedores sin Pérdida de Catálogo, CMDB, Tickets e Historial
- **Comando Ejecutado:** `POST /api/harness/run { testId: 'P18' }`
- **Entrada:** Verificación de persistencia de datos en volumen Docker `mariadb_data` tras ciclos de detención y arranque (`docker compose down` y `docker compose up -d`).
- **Resultado Esperado:** 12 N1, 46 N2, $\ge 5,000$ CIs, 7 colas, usuarios y 35 tickets íntegros sin pérdida de relaciones ni claves foráneas.
- **Resultado Obtenido:** Conforme. Persistencia comprobada mediante volumen nombrado independiente del contenedor.
- **Fecha:** 2026-10-27 | **Commit:** `4a8ff49` | **Estado:** `PASSED`
