# Prompt Engineering — Registro de Prompts e Iteraciones de Mejora

**Asignatura:** Software Avanzado — USAC  
**Estudiante:** Enner (Carné: 202302220)  
**Catedrático Evaluador:** Marco Tulio Aldana Prillwitz (`maldanap-usac`)  
**Modelo Utilizado:** Gemini 3.8 Flash (High)  
**Herramienta:** Antigravity AI IDE (Pair Programming Agent)  
**Fechas de Ejecución:** 2026-09-30 a 2026-10-03  
**Versión de Contexto:** 2.0.0 (Tag: `parcial-v2.0`)  

---

## 1. Registro de Prompts Reales Utilizados

### Prompt 1: Análisis Estructural del Excel y Celdas Combinadas
- **Fecha:** 2026-09-30  
- **Objetivo:** Analizar `CatalogoServicios.xlsx` e identificar por qué el conteo de filas físicas difiere del total de servicios de Nivel 1 y Nivel 2.
- **Contexto suministrado:** Hoja `Servicios Externos`, rangos de celdas combinadas `A5:A9`, `B26:B55`, y controles de importación (12 N1 y 46 N2).
- **Instrucciones:**  
  > *"Inspecciona la hoja 'Servicios Externos' de CatalogoServicios.xlsx. Determina la regla exacta para extraer solo los servicios legítimos sin duplicar filas debido a celdas combinadas."*
- **Restricciones:** No asumir que cada fila física es un servicio; identificar cómo tratar las celdas esclavas de rangos combinados; respetar la inmutabilidad del archivo original.
- **Salida esperada:** Algoritmo de extracción con los conteos exactos de 12 N1 y 46 N2.
- **Criterio de aceptación:** Que la inspección identifique exactamente los 46 códigos L2 (`SE.01.01` hasta `SE.12.3`) y los 12 L1 (`SE.01` a `SE.12`).

---

### Prompt 2: Diseño del Modelo Relacional Jerárquico en TypeORM
- **Fecha:** 2026-09-30  
- **Objetivo:** Definir las entidades relacionales de la jerarquía organizacional estricta de 6 niveles y el catálogo de servicios en MariaDB.
- **Contexto suministrado:** Sección 3.2 de `statement.md` (Empresa $\rightarrow$ Área $\rightarrow$ Departamento $\rightarrow$ Sección $\rightarrow$ Puesto $\rightarrow$ Usuario) y catálogos de servicios con umbrales y roles RACI.
- **Instrucciones:**  
  > *"Crea las entidades de TypeORM para MariaDB con las relaciones jerárquicas exactas, claves foráneas con restricción de eliminación y reglas de unicidad compuesta."*
- **Restricciones:** Los códigos de entidades subordinadas deben ser únicos dentro de su padre; la contraseña del usuario debe almacenarse como hash con sal y nunca exponerse en respuestas públicas.
- **Salida esperada:** Clases `@Entity` TypeScript compilables con relaciones `ManyToOne` y `OneToMany`.
- **Criterio de aceptación:** Modelos válidos sin dependencias circulares y con soporte de borrado lógico (`activo: boolean`).

---

### Prompt 3: Autenticación Local y Control de Acceso RBAC
- **Fecha:** 2026-09-30  
- **Objetivo:** Implementar endpoints `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` con hash seguro y control de acceso por roles.
- **Contexto suministrado:** Requisitos de la sección 3.1: autenticación propia contra base de datos local, dos roles (`administrador` y `consulta`), e invalidación de sesión al logout.
- **Instrucciones:**  
  > *"Implementa un módulo de autenticación en NestJS con Bcrypt para el hash, JWT para el token de sesión, un guardia para validar usuarios activos y una lista negra en memoria para invalidar tokens cerrados."*
- **Restricciones:** No usar OAuth externo (Google, GitHub); rechazar de inmediato a usuarios con `activo = false`.
- **Salida esperada:** `AuthService`, `AuthController`, `JwtStrategy`, `RolesGuard`.
- **Criterio de aceptación:** Tests P01, P02 y P03 aprobados exitosamente.

---

### Prompt 4: Importador Idempotente y Resolución de SE.12
- **Fecha:** 2026-09-30  
- **Objetivo:** Procesar el archivo Excel original resolviendo el conflicto de nombres en SE.12 y conservando atributos ausentes.
- **Contexto suministrado:** Filas 99 a 101 de `CatalogoServicios.xlsx`: conflicto entre "Suministrar Analitica" y "Mantener Tableros de Control" y columnas E a L nulas.
- **Instrucciones:**  
  > *"Desarrolla el servicio de importación con ExcelJS. Define el nombre canónico oficial de SE.12 como 'Suministrar Analítica', genera una observación formal del alias detectado y asegura que repetir la importación produzca 0 duplicados."*
- **Restricciones:** No modificar el archivo original; no convertir nulos a cero ni inventar criticidades o tipos.
- **Salida esperada:** `ImporterService` con reporte estructurado de creados, actualizados, omitidos y observaciones.
- **Criterio de aceptación:** 12 códigos N1 y 46 códigos N2 registrados en primera ejecución; 0 creados en segunda ejecución.

---

### Prompt 5: Suite Automatizada de Pruebas P01–P12 y Harness
- **Fecha:** 2026-09-30  
- **Objetivo:** Automatizar la verificación de los 12 criterios de aceptación del enunciado con ejecución reproducible vía CLI y UI.
- **Contexto suministrado:** Tabla de escenarios P01 a P12 de la sección 6 de `statement.md`.
- **Instrucciones:**  
  > *"Construye una suite de pruebas en Jest y un servicio de harness programático que evalúe secuencialmente los 12 escenarios y reporte códigos de salida, tiempos de respuesta y detalles de aserción."*
- **Restricciones:** Las pruebas no deben depender de servicios externos ni destruir permanentemente las cuentas demo de evaluación.
- **Salida esperada:** `HarnessService`, `HarnessController`, `harness.spec.ts` y script `run_tests.sh`.
- **Criterio de aceptación:** Salida con código 0 y 12/12 escenarios aprobados.

---

### Prompt 6: Rediseño Minimalista de Frontend (Estilo Suizo y Tipografía Funcional)
- **Fecha:** 2026-10-02  
- **Objetivo:** Transformar la interfaz web reemplazando gradientes llamativos y sombras pesadas por un diseño sobrio, técnico y limpio, apto para un sistema corporativo de servicios de TI.
- **Contexto suministrado:** Feedback del usuario: *"hazlo más minimalista o menos excesivamente colorido/llamativo, donde no se abuse de sombras ni redondeos; diseño limpio y profesional"*.
- **Instrucciones:**  
  > *"Rehaz la interfaz usando una estética minimalista tipo Swiss Design: bordes sutiles en zinc-200, fuentes monospace para métricas y códigos, tablas de densidad compacta, fichas técnicas tipo informe ITIL y paleta sobria basada en escala de grises con acentos funcionales en esmeralda."*
- **Restricciones:** Mantener la funcionalidad de filtros, modales, árbol organizacional y consola de pruebas sin alterar contratos de API.
- **Salida esperada:** Componentes Next.js (`Navbar`, `page.tsx`, `catalogo/page.tsx`, `organizacion/page.tsx`, `harness/page.tsx`).
- **Criterio de aceptación:** Interfaz con contraste accesible, densidad informativa profesional y libre de decoraciones superfluas.

---

### Prompt 7: Resolución de Proxy Dinámico en Contenedores Docker (Standalone Mode)
- **Fecha:** 2026-10-02  
- **Objetivo:** Solucionar el error de conexión `ECONNREFUSED` en Next.js provocado por la compilación estática de `rewrites()` en `next.config.mjs`.
- **Contexto suministrado:** En modo standalone de Next.js, `rewrites` evalúa las variables de entorno en tiempo de build, horneando `localhost:4000` en lugar del nombre DNS del contenedor `backend:4000`.
- **Instrucciones:**  
  > *"Implementa un Route Handler dinámico en `app/api/[...path]/route.ts` que capture todas las solicitudes a `/api/*` y las reenvíe en tiempo de ejecución (runtime) a `process.env.BACKEND_INTERNAL_URL || 'http://backend:4000'`, preservando cabeceras de autorización y métodos HTTP."*
- **Restricciones:** No exigir cambios en el cliente ni alterar la ruta base de la API.
- **Salida esperada:** Handler Next.js 14 que resuelva el puente de red Docker frontend-backend de forma transparente.
- **Criterio de aceptación:** Peticiones a `/api/catalog/n2` responden con código 200 y 46 servicios sin fallas de red.

---

## 2. Iteraciones de Mejora Documentadas

### Iteración 1: Extracción de Servicios en Presencia de Celdas Combinadas
- **Fecha:** 2026-09-30  
- **Prompt Inicial:**
  ```text
  "Lee la columna C de Servicios Externos en CatalogoServicios.xlsx usando cell.master.value y devuelve todos los servicios Nivel 2."
  ```
- **Problema Observado:**  
  Al usar `cell.master.value` en un ciclo de filas de la 5 a la 101, cada fila perteneciente a una combinación (por ejemplo, `C5:C7`) devolvía el código del máster (`SE.01.01`) 3 veces, produciendo **95 registros** en lugar de los 46 servicios base legítimos.
- **Prompt Revisado:**
  ```text
  "Ajusta la extracción para evaluar si la celda es esclava de un rango combinado: si cell.isMerged && (cell.address !== cell.master.address), ignora la fila ya que es una continuación de celda combinada. Solo procesa filas donde la celda sea la celda principal o no combinada."
  ```
- **Resultado Comprobado:**  
  El conteo resultante fue de **exactamente 46 servicios de Nivel 2**, eliminando las 49 filas fantasma y cumpliendo el control de calidad estricto.

---

### Iteración 2: Regla de Responsabilidad RACI (Escenario P11)
- **Fecha:** 2026-09-30  
- **Prompt Inicial:**
  ```text
  "Permite asignar cualquier usuario existente como usuarioResponsableId en ServicioN2."
  ```
- **Problema Observado:**  
  El sistema permitía asignar un usuario perteneciente a la Sección de Desarrollo a un servicio cuya Sección Responsable era Infraestructura, violando la gobernanza RACI y la regla de aceptación P11 del enunciado.
- **Prompt Revisado:**
  ```text
  "En el DTO y servicio de Catálogo, implementa la validación de servidor para que, si se especifica usuarioResponsableId, se consulte la entidad Usuario con su puesto y sección. Si usuario.puesto.seccionId !== seccionResponsableId, rechaza la operación inmediatamente con BadRequestException (HTTP 400): 'Violación de gobernanza RACI: El usuario responsable debe pertenecer a la sección responsable del servicio'."
  ```
- **Resultado Comprobado:**  
  El escenario de prueba P11 rechazó exitosamente asignaciones cruzadas indebidas con HTTP 400 y mensaje comprensible, pasando la prueba al 100%.

---

### Iteración 3: Preservación de Umbrales Nulos vs Coerción Numérica (Escenario P08)
- **Fecha:** 2026-10-01  
- **Prompt Inicial:**
  ```text
  "Convierte las celdas de mínimo y máximo del Excel usando Number(val) || 0 para almacenar los umbrales numéricos en la entidad ServicioN2."
  ```
- **Problema Observado:**  
  La prueba P08 y la inspección de base de datos revelaron que servicios sin umbrales en el Excel (filas 6 a 24) se guardaron con `minimo: 0` y `maximo: 0`. Esto violaba la regla del enunciado: *"Conserven los valores originales... si no existen valores, se preservan como NULL"*.
- **Prompt Revisado:**
  ```text
  "Modifica el mapeo de umbrales en ImporterService: si la celda está vacía o es nula, asigna null explícito. Nunca apliques coerción a cero. Asegura que la columna de TypeORM sea nullable: true y que la validación minimo <= maximo solo se active cuando ambos campos no sean nulos."
  ```
- **Resultado Comprobado:**  
  Los 44 servicios sin umbral se almacenaron con `NULL` real en la base de datos MariaDB, aprobando la aserción de fidelidad de P08 al 100%.

---

### Iteración 4: Protección Estricta de Dashboard y Redirección No Autenticada (Escenario P02)
- **Fecha:** 2026-10-02  
- **Prompt Inicial:**
  ```text
  "En el dashboard de Next.js muestra un aviso informativo de 'Modo consulta pública' si el usuario no ha iniciado sesión."
  ```
- **Problema Observado:**  
  Aunque el backend rechazaba las peticiones sin token (401), la interfaz dejaba ver el cascarón de métricas del dashboard a usuarios anónimos. Esto contradecía el propósito del rol `consulta` (que existe específicamente para acceder con credenciales de lectura) y comprometía la consistencia con el Escenario P02.
- **Prompt Revisado:**
  ```text
  "En DashboardPage, CatalogoPage y OrganizacionPage implementa una guardia de sesión estricta: si !authLoading && !user, redirige inmediatamente a /login con router.push('/login') y no renderices ningún dato o tarjeta. En Navbar, oculta los enlaces de navegación funcional si no hay sesión activa."
  ```
- **Resultado Comprobado:**  
  Cualquier intento de navegación anónima redirige forzosamente a `/login`. La seguridad es coherente entre backend (HTTP 401) y frontend (redirección instantánea), validando P02 en ambas capas.
