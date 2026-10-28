# PROCESOS.md — Especificación de Procesos ITIL, Colas, Estados y Gobernanza de Service Desk

**Proyecto:** Sistema de Service Desk y Gestión de CMDB con IA Asistida  
**Asignatura:** Software Avanzado — USAC  
**Estudiante:** Enner (Carné: 202302220)  
**Catedrático Evaluador:** Marco Tulio Aldana Prillwitz (`maldanap-usac`)  
**Versión:** 3.0.0  
**Fecha:** Octubre 2026  

---

## 1. Mapeo Canónico: Tipos de Ticket (Diapositiva 14) vs. 7 Procesos Obligatorios

De acuerdo con la Lección 25 (*Service Desk*, Diapositiva 14) y los requisitos del Parcial 3, el sistema establece una correspondencia formal, explícita y bidireccional entre la tipología de solicitudes recibidas por el punto único de contacto (SPOC) y los 7 procesos ITIL implementados en el motor de flujos:

| Tipo de Ticket (Slide 14) | Proceso ITIL Asociado | Subtipo / Variación | Código Cola Demostración | Propósito Operativo |
| :--- | :--- | :--- | :--- | :--- |
| **Requisición de Servicio** | Gestión de Nuevos Servicios | `nuevo_servicio` | `COLA-NSER` | Incorporar nuevos servicios al catálogo de TI tras análisis de viabilidad técnica y financiera. |
| **Solicitud de Cambio (RFC)** | Gestión de Cambios | `cambio_normal` / `estandar` | `COLA-CAMB` | Evaluar riesgo e impacto, aprobar por CAB y autorizar ejecución controlada de cambios en CI. |
| **Incidente** | Gestión de Incidentes | `incidente_estandar` | `COLA-INCI` | Restaurar la operación normal del servicio en el menor tiempo posible minimizando el impacto adverso. |
| **Evento** | Gestión de Eventos | `evento_monitoreo` | `COLA-EVEN` | Detectar, filtrar y clasificar notificaciones de monitorización; escalar a incidente si hay impacto o brecha de seguridad. |
| **Problema** | Gestión de Problemas | `problema_raiz` | `COLA-PROB` | Diagnosticar la causa raíz de incidentes recurrentes o graves, publicar errores conocidos y gestionar su solución definitiva. |
| **Solicitud de Acceso** | Gestión de Accesos | `solicitud_acceso` | `COLA-ACCE` | Otorgar, modificar o revocar permisos sobre recursos o servicios garantizando que el solicitante no se autoapruebe. |
| **Requisición de Servicio** | Gestión de Servicios TI | `servicio_existente` | `COLA-SERV` | Tramitar solicitudes operativas estándar sobre servicios activos del catálogo ya aprobados. |

---

## 2. Definición Detallada de los Siete Procesos Obligatorios

### 2.1 Proceso 1: Gestión de Nuevos Servicios
- **Objetivo:** Recibir solicitudes de incorporación o rediseño sustancial de servicios tecnológicos, analizando necesidad, viabilidad técnica/presupuestaria y aprobando su alta en el catálogo oficial de servicios.
- **Flujo de Estados:**
  ```mermaid
  stateDiagram-v2
      [*] --> nuevo: Solicitud registrada
      nuevo --> analisis: Iniciar análisis de viabilidad
      analisis --> en_aprobacion: Enviar informe a comité
      en_aprobacion --> rechazado: Rechazo con justificación
      en_aprobacion --> aprobado: Aprobación formal
      aprobado --> en_implementacion: Inicio de provisión
      en_implementacion --> resuelto: Servicio configurado en catálogo
      resuelto --> cerrado: Validación final del solicitante
      cerrado --> [*]
      rechazado --> [*]
  ```
- **Condiciones de Entrada:** Solicitante activo, descripción funcional detallada, justificación técnica y de negocio.
- **Condiciones de Salida / Aprobación:** La transición a `aprobado` y `resuelto` permite registrar o vincular el nuevo servicio N2 en la tabla `servicios_n2` del catálogo sin duplicar códigos existentes.

---

### 2.2 Proceso 2: Gestión de Cambios (RFC - Request For Change)
- **Objetivo:** Controlar el ciclo de vida de cualquier cambio en la infraestructura o software para minimizar el riesgo de indisponibilidad del servicio.
- **Flujo de Estados:**
  ```mermaid
  stateDiagram-v2
      [*] --> nuevo: Registro de RFC
      nuevo --> evaluacion_impacto: Análisis de riesgo y CI
      evaluacion_impacto --> en_aprobacion: Presentación a CAB
      en_aprobacion --> rechazado: CAB rechaza el cambio
      en_aprobacion --> aprobado: Aprobación formal por rol Aprobador
      aprobado --> planificacion: Definición de cronograma
      planificacion --> ejecucion: Ventana de mantenimiento
      ejecucion --> validacion: Pruebas post-implementación
      validacion --> resuelto: Cambio exitoso
      validacion --> cerrado: Validación de conformidad
      cerrado --> [*]
      rechazado --> [*]
  ```
- **Regla Estricta de Seguridad:** El servidor rechaza cualquier intento de transición directa a `ejecucion` si el ticket no ha sido previamente transicionado a `aprobado` por un usuario con permiso de aprobación (`puedeAprobar = true` o rol `administrador`/`aprobador`).
- **Campos Obligatorios:** Elementos de configuración (CI) afectados, plan de pruebas documentado y plan de reversión (*rollback*).

---

### 2.3 Proceso 3: Gestión de Incidentes
- **Objetivo:** Diagnosticar y resolver cualquier interrupción o degradación del servicio en el menor tiempo posible.
- **Flujo de Estados:**
  ```mermaid
  stateDiagram-v2
      [*] --> nuevo: Registro del incidente
      nuevo --> clasificado: Asignación I0-I6 y CI
      clasificado --> asignado: Reclamado por agente
      asignado --> diagnostico: Análisis técnico inicial
      diagnostico --> escalado: Escalamiento a N2/N3/N4
      escalado --> diagnostico: Diagnóstico especializado
      diagnostico --> atencion: Aplicación de solución
      atencion --> recuperacion: Servicio restaurado
      recuperacion --> resuelto: Solución aplicada registrada
      resuelto --> cerrado: Conformidad del usuario
      cerrado --> [*]
      resuelto --> reabierto: Falla reincidente dentro del SLA
      reabierto --> asignado: Reevaluación
  ```
- **Categorización I0–I6 (Lección 25, Diapositiva 16):**
  - **I0:** No causa interrupción de servicio (cosmético, consulta informativa).
  - **I1:** Interrupción o degradación de 3 horas o menos.
  - **I2:** Interrupción o degradación de 8 horas o menos.
  - **I3:** Interrupción de 2 días o menos.
  - **I4:** Interrupción de 1 semana o menos.
  - **I5:** Interrupción de 1 mes o más (falla catastrófica de infraestructura).
  - **I6:** Afecta críticamente la seguridad de los recursos y la confidencialidad/integridad de la información.
- **Regla de Negocio:** No se permite transicionar a `resuelto` ni `cerrado` si el campo `solucionAplicada` está vacío.

---

### 2.4 Proceso 4: Gestión de Eventos
- **Objetivo:** Registrar las señales y alertas generadas por los sistemas de monitorización y clasificar su impacto operativo.
- **Flujo de Estados:**
  ```mermaid
  stateDiagram-v2
      [*] --> nuevo: Alerta capturada
      nuevo --> evaluacion: Análisis de impacto operativo
      evaluacion --> respuesta_operativa: Atención de evento
      respuesta_operativa --> resuelto: Condición normalizada
      resuelto --> cerrado: Cierre de bitácora
      cerrado --> [*]
  ```
- **Clasificación E0–E3 (Lección 25, Diapositiva 15):**
  - **E0:** Evento programado (mantenimiento regular, respaldo planificado). Solo requiere registro.
  - **E1:** Evento no programado sin impacto al servicio en capacidad, disponibilidad ni rendimiento. No requiere respuesta inmediata, se conserva registro de evaluación.
  - **E2:** Evento no programado con impacto al servicio. **Acción obligatoria:** El backend genera o vincula automáticamente un ticket de incidente asociado y emite una notificación de advertencia en bitácora.
  - **E3:** Evento no programado con impacto en la seguridad de la información. **Acción obligatoria:** El backend genera o vincula automáticamente un incidente clasificado como I6 (seguridad) y emite alerta verificable.
- **Idempotencia de Eventos:** Si se reevalúa o reprocesa el mismo evento, el sistema detecta la vinculación preexistente y no crea incidentes duplicados.

---

### 2.5 Proceso 5: Gestión de Problemas
- **Objetivo:** Identificar la causa subyacente de incidentes recurrentes, documentar soluciones provisionales en la base de errores conocidos (KEDB) y coordinar la solución definitiva mediante una Solicitud de Cambio.
- **Flujo de Estados:**
  ```mermaid
  stateDiagram-v2
      [*] --> nuevo: Problema abierto
      nuevo --> investigacion: Análisis de causa raíz (RCA)
      investigacion --> solucion_temporal: Workaround identificado
      solucion_temporal --> error_conocido: Registro en KEDB
      error_conocido --> solucion_definitiva: RFC vinculada
      solucion_definitiva --> resuelto: Corrección desplegada
      resuelto --> cerrado: Cierre del problema e incidentes ligados
      cerrado --> [*]
  ```
- **Trazabilidad:** Permite relacionar múltiples incidentes al problema mediante la tabla `tickets_relaciones` (`tipoRelacion = 'incidente_de_problema'`), y vincular la RFC que implementa la solución definitiva (`tipoRelacion = 'cambio_de_problema'`).

---

### 2.6 Proceso 6: Gestión de Accesos
- **Objetivo:** Proveer y revocar derechos de uso sobre recursos, sistemas y servicios de TI de forma controlada y auditada.
- **Flujo de Estados:**
  ```mermaid
  stateDiagram-v2
      [*] --> nuevo: Solicitud de derecho
      nuevo --> en_aprobacion: Envío a jefatura / dueño de datos
      en_aprobacion --> rechazado: Aprobación denegada
      en_aprobacion --> aprobado: Aprobación por tercero autorizado
      aprobado --> provision: Creación de credenciales / permisos
      provision --> validacion: Verificación de acceso por usuario
      validacion --> resuelto: Acceso comprobado
      resuelto --> cerrado: Cierre formal
      cerrado --> [*]
      rechazado --> [*]
  ```
- **Regla Estricta de Segregación de Funciones:** El servidor verifica que `solicitanteId !== aprobadorId`. Un usuario no puede autoaprobarse su propia solicitud de acceso, respondiendo con código HTTP 400 Bad Request si lo intenta.

---

### 2.7 Proceso 7: Gestión de Servicios de Tecnología
- **Objetivo:** Tramitar y entregar solicitudes estándar de servicios operativos ya disponibles en el catálogo (p. ej. creación de buzón de correo, instalación de software estándar, aprovisionamiento de periféricos).
- **Flujo de Estados:**
  ```mermaid
  stateDiagram-v2
      [*] --> nuevo: Requisición de servicio
      nuevo --> validacion: Verificación de políticas y elegibilidad
      validacion --> asignado: Asignación a técnico especialista
      asignado --> cumplimiento: Ejecución del servicio solicitado
      cumplimiento --> confirmacion: Confirmación de entrega al usuario
      confirmacion --> resuelto: Servicio entregado
      resuelto --> cerrado: Aceptación final
      cerrado --> [*]
  ```

---

## 3. Niveles de Soporte y Estructura de Escalamiento

### 3.1 Resolución de la Discrepancia Documental (Diapositiva 11 vs. Diapositivas 12–13)
En el material de clase se presentan dos esquemas de niveles de soporte:
- **Diapositiva 11:** Esquema de 5 niveles (Nivel 0 al 4):
  - *Nivel 0:* Autoservicio (Self-service / FAQ).
  - *Nivel 1:* Centro de Servicio (Help Desk - 20% referencial).
  - *Nivel 2:* Soporte Técnico / Especialistas TI (70% referencial).
  - *Nivel 3:* Ingenieros de Sistemas y Redes (5% referencial).
  - *Nivel 4:* Soporte Externo / Fabricantes (5% referencial).
- **Diapositivas 12 y 13:** Esquema simplificado de 4 niveles (Nivel 0 al 3), donde el Nivel 3 fusiona a los especialistas internos avanzados con los proveedores externos.

**Decisión Canónica Adoptada:**  
El sistema adopta como modelo canónico formal la jerarquía extensible de **5 niveles (0 a 4)** de la Diapositiva 11, parametrizada en la entidad `colas_atencion` (`nivelSoporte`: entero de 0 a 4). De esta manera:
- Se preserva la granularidad para distinguir soporte interno de ingeniería (Nivel 3) frente a contratos con proveedores/fabricantes externos (Nivel 4).
- Las colas asociadas a proveedores externos registran `nivelSoporte = 4`.
- Los porcentajes de carga operativa (20%, 70%, 5%, 5%) se documentan en el panel como métricas de referencia estadística de la industria, sin que el sistema fuerce cuotas arbitrarias de tickets.

---

## 4. Colas de Atención, Roles y Matriz de Permisos

### 4.1 Colas de Demostración Iniciales
El sistema arranca con 7 colas operativas, garantizando exactamente una por proceso:

| Código | Nombre de la Cola | Proceso Asignado | Nivel Soporte | SLA Atención | SLA Resolución | Regla de Orden |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `COLA-NSER` | Cola de Nuevos Servicios TI | `gestion_nuevos_servicios` | 2 | 4 horas | 48 horas | Prioridad DESC, Fecha Creación ASC |
| `COLA-CAMB` | Cola de Gestión de Cambios (CAB) | `gestion_cambios` | 3 | 2 horas | 24 horas | Prioridad DESC, Fecha Creación ASC |
| `COLA-INCI` | Cola de Incidentes y Operaciones | `gestion_incidentes` | 1 | 15 min | 4 horas | Prioridad DESC, Fecha Creación ASC |
| `COLA-EVEN` | Cola de Monitorización y Eventos | `gestion_eventos` | 1 | 10 min | 2 horas | Prioridad DESC, Fecha Creación ASC |
| `COLA-PROB` | Cola de Gestión de Problemas | `gestion_problemas` | 3 | 8 horas | 72 horas | Prioridad DESC, Fecha Creación ASC |
| `COLA-ACCE` | Cola de Aprovisionamiento y Accesos | `gestion_accesos` | 1 | 30 min | 8 horas | Prioridad DESC, Fecha Creación ASC |
| `COLA-SERV` | Cola de Cumplimiento de Servicios TI | `gestion_servicios_tecnologia` | 1 | 1 hora | 8 horas | Prioridad DESC, Fecha Creación ASC |

### 4.2 Matriz de Autorización por Cola
Cada usuario o rol asignado a una cola posee banderas booleanas independientes en `colas_usuarios` y `colas_roles`:

| Permiso | Propósito | Restricción Servidor |
| :--- | :--- | :--- |
| `puedeConsultar` | Ver los tickets asignados a la cola y sus detalles. | Permitido a agentes, aprobadores y usuarios asignados. |
| `puedeAtender` | Reclamar (tomar) tickets, cambiar estados de diagnóstico y resolución. | Requiere rol `agente` o `administrador`. |
| `puedeTransferir` | Mover el ticket a otra cola válida del mismo o compatible proceso. | Registra motivo en bitácora obligatoriamente. |
| `puedeAprobar` | Aprobar o rechazar RFCs o solicitudes de acceso. | Bloqueado si el usuario es el mismo solicitante. |
| `puedeAdministrar` | Modificar SLAs, nombres o desactivar la cola. | Exclusivo de administradores de Service Desk. |

> [!CRITICAL]
> **Protección del Rol `consulta`:**  
> Si un usuario con rol base `consulta` es añadido a una cola de atención, el servidor intercepta la petición y deniega estrictamente cualquier intento de ejecución operativa (`puedeAtender`, `puedeTransferir`, `puedeAprobar`, `puedeAdministrar`). El rol de consulta permanece de solo lectura en todo el sistema.

---

## 5. Asignación Concurrente y Ordenamiento Determinista

### 5.1 Regla Determinista de Ordenamiento
Los agentes reciben los tickets ordenados bajo el siguiente criterio estricto:
$$\text{Ordenamiento} = \text{Prioridad (Crítica} > \text{Alta} > \text{Media} > \text{Baja)} \quad \longrightarrow \quad \text{Fecha de Creación (Antigüedad Ascendente)}$$

### 5.2 Control de Concurrencia (Race Condition Prevention)
Para evitar que dos agentes asignados a la misma cola reclamen simultáneamente el mismo ticket mediante clics concurrentes:
1. Se utiliza una instrucción SQL atómica con condición de guarda:
   ```sql
   UPDATE tickets 
   SET responsableId = :agenteId, 
       estado = 'asignado', 
       fechaActualizacion = NOW() 
   WHERE id = :ticketId 
     AND (responsableId IS NULL OR estado = 'nuevo');
   ```
2. Si dos transacciones intentan ejecutar la asignación al mismo tiempo, la primera actualiza la fila (`affectedRows = 1`). La segunda obtiene `affectedRows = 0` debido al aislamiento de la transacción.
3. El servidor detecta `affectedRows === 0` y rechaza inmediatamente la segunda petición con un error explícito:  
   `HTTP 409 Conflict: "El ticket ya fue tomado por otro agente."`

---

## 6. Transferencia entre Colas y Desactivación Restrictiva

1. **Transferencia entre Colas:**
   - La transferencia exige indicar el ID de la cola destino y un motivo textual obligatorio.
   - La cola destino debe estar activa y pertenecer a un proceso compatible con la naturaleza del ticket.
   - El actor, la fecha, la cola origen, la cola destino y el motivo quedan asentados de forma indeleble en la bitácora (`tickets_bitacora`).
2. **Desactivación Restrictiva de Colas:**
   - No se permite desactivar una cola si contiene tickets en estado abierto (`nuevo`, `asignado`, `en_progreso`, `diagnostico`, `planificacion`, etc.).
   - El administrador debe transferir previamente los tickets activos a otra cola funcional para evitar dejar tickets huérfanos.

---

## 7. Métrica de Indicadores del Tablero (KPIs)

El cálculo de métricas en `/api/tickets/dashboard` implementa las siguientes reglas documentadas:
1. **Tiempo de Primera Atención (TPA):** Diferencia en minutos entre `fechaCreacion` y la fecha de asignación/primer comentario de agente. Los tickets nuevos no asignados computan su tiempo transcurrido hasta el momento actual.
2. **Tiempo de Resolución (TR):** Diferencia en minutos entre `fechaCreacion` y `fechaResolucion`.
3. **Cumplimiento de SLA:** Porcentaje de tickets resueltos dentro del `slaResolucionHoras` configurado en la cola.
4. **Tratamiento de Reaperturas y Pausas:** Cuando un ticket es reabierto, se registra el evento en bitácora y el cronómetro de resolución continúa acumulando tiempo efectivo desde la reapertura.
5. **Tipo de Tiempo:** Las métricas de este Service Desk utilizan **tiempo calendario continuo (24/7)** para reflejar la disponibilidad real del servicio de TI.
