# Service Desk & CMDB con Ingeniería Asistida por IA (Parcial Práctico 3)

**Asignatura:** Software Avanzado — Universidad de San Carlos de Guatemala  
**Estudiante:** Enner (Carné: 202302220)  
**Catedrático Evaluador:** Marco Tulio Aldana Prillwitz (`maldanap-usac`)  
**Fecha de Entrega:** Octubre 2026  
**Versión y Etiqueta:** `tarea-v3.0`  
**Repositorio Oficial:** `https://github.com/Ennero/parcial-catalogo-servicios-202302220`  

---

## 1. Descripción del Proyecto

Aplicación web empresarial de **Service Desk y Base de Datos de Gestión de la Configuración (CMDB)** que amplía y perfecciona la base del catálogo de servicios de TI (Parcial 2). La solución incorpora:
- **CMDB Jerárquica con $\ge 5,000$ Elementos de Configuración (CI) sintéticos persistidos**, fiel a la Lección 22 y `CMDB.xlsx`, con validación de Grafos Acíclicos Dirigidos (DAG) para dependencias funcionales, soporte de topologías en anillo en enlaces de red y cálculo de impacto downstream (*blast radius*).
- **Punto Único de Contacto (SPOC) para 7 Procesos ITIL Obligatorios:** Nuevos Servicios, Gestión de Cambios (RFC), Incidentes (I0–I6), Eventos (E0–E3), Problemas, Accesos (sin autoaprobación) y Requisiciones de Servicios TI.
- **Colas de Atención con Soporte Multinivel (0 a 4) y RBAC granular:** Niveles L0 (FAQ/Autoservicio) a L4 (Externo/Proveedores), asignación atómica de tickets sin condiciones de carrera (HTTP 409 Conflict si compiten agentes) y blindaje del rol `consulta`.
- **Portal del Solicitante y Consola de Agentes:** Buscador de FAQ, creación de tickets con/sin CI (con justificación obligatoria), notas internas vs comentarios públicos y bitácora de auditoría histórica inmutable.
- **Demostración de las 5 Ingenierías con IA:** Prompt Engineering (8 prompts reales y 2 refinamientos iterativos), Context Engineering (`AGENTS.md` v2.0.0 y Data Trust Boundary), Harness Engineering (suite automatizada P01 a P18), Loop Engineering (3 ciclos completos con fallos deliberados corregidos) y Graph Engineering (árboles CMDB y blast radius).

---

## 2. Requisitos Previos

- **Docker:** Versión 24.0+ o Docker Desktop reciente.
- **Docker Compose:** Versión v2 o superior (`docker compose`).
- *No se requiere instalar Node.js, TypeScript ni MariaDB en el equipo anfitrión.*

---

## 3. Instrucciones de Construcción y Arranque Rápido (Clean Clone)

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Ennero/parcial-catalogo-servicios-202302220.git
cd parcial-catalogo-servicios-202302220
```

### Paso 2: Construir y Levantar los Contenedores
```bash
docker compose up --build -d
```

Los servicios se iniciarán automáticamente en el orden estricto de dependencias:
1. `catalogo-mariadb` (MariaDB 11 LTS en puerto `3306` con volumen persistente `mariadb_data`).
2. `catalogo-backend` (NestJS 10 en puerto `4000`). Al arrancar por primera vez, ejecuta automáticamente los seeds de evaluación:
   - Cuentas de demostración seguras.
   - 7 Colas de atención preconfiguradas.
   - Taxonomía CMDB de 4 niveles y **5,000 CIs sintéticos reproducibles con semilla `202302220`**.
   - 35 tickets de prueba distribuidos entre los 7 procesos (incluyendo casos E0–E3 e I0–I6).
   - Catálogo de servicios (12 N1 y 46 N2).
3. `catalogo-frontend` (Next.js 14 App Router en puerto `3000`).

---

## 4. URLs de Acceso al Sistema

| Módulo / Vista | URL Local | Descripción |
| :--- | :--- | :--- |
| **Tablero de Control (Dashboard)** | [http://localhost:3000](http://localhost:3000) | KPIs de atención, TR, TPA, SLAs y distribución de tickets por proceso. |
| **Portal del Solicitante** | [http://localhost:3000/portal](http://localhost:3000/portal) | Autoservicio L0 con FAQ y formulario de creación de tickets con/sin CI. |
| **Consola de Agentes** | [http://localhost:3000/tickets](http://localhost:3000/tickets) | Bandeja de tickets, filtros por cola, toma concurrente, transiciones y bitácora. |
| **Explorador CMDB (5,000 CIs)** | [http://localhost:3000/cmdb](http://localhost:3000/cmdb) | Búsqueda paginada en tiempo real, detalles técnicos y cálculo de impacto de grafo. |
| **Panel Web de Pruebas (Harness)** | [http://localhost:3000/harness](http://localhost:3000/harness) | Ejecutor interactivo de los 18 escenarios de prueba automatizados (P01 a P18). |
| **Catálogo de Servicios N1/N2** | [http://localhost:3000/catalogo](http://localhost:3000/catalogo) | Visualizador con gobernanza ITIL y matriz RACI. |
| **Estructura Organizacional** | [http://localhost:3000/organizacion](http://localhost:3000/organizacion) | Árbol jerárquico de 6 niveles con política restrictiva de bajas lógicas. |
| **API REST Backend** | [http://localhost:4000](http://localhost:4000) | Servidor NestJS con documentación de endpoints. |

---

## 5. Cuentas Locales de Demostración para Evaluación

Todas las contraseñas están protegidas mediante hash criptográfico **Bcrypt con sal**:

| Correo / Usuario | Contraseña | Rol Principal | Roles Secundarios | Propósito en la Evaluación |
| :--- | :--- | :--- | :--- | :--- |
| `admin@usac.edu` | `Admin123!` | `administrador` | `agente,aprobador` | Control total, configuración de colas, gestión de CMDB y administración general. |
| `agente@usac.edu` | `Agente123!` | `agente` | — | Atención de tickets, diagnóstico, toma atómica y resolución técnica. |
| `aprobador@usac.edu` | `Aprobador123!` | `aprobador` | `agente` | Evaluación y aprobación de cambios (CAB) y solicitudes de acceso. |
| `solicitante@usac.edu`| `Solicitante123!`| `solicitante` | — | Apertura y consulta de solicitudes en el Portal de Autoservicio L0. |
| `consulta@usac.edu` | `Consulta123!` | `consulta` | — | Auditoría y solo lectura; **bloqueado para mutaciones y atención (P06)**. |
| `inactivo@usac.edu` | `Inactivo123!` | `consulta` | — | **Validación P01:** comprobación inmediata del rechazo a usuarios dados de baja. |

> [!TIP]
> En la pantalla de inicio de sesión (`/login`), se encuentran botones de acceso rápido para autenticarse automáticamente con cualquiera de estas cuentas con un solo clic.

---

## 6. Ejecución del Harness de Pruebas Automatizadas (P01 a P18)

### Opción A: Vía Terminal (CLI — Recomendado para calificación directa)
```bash
./scripts/run_tests.sh
# O ejecutando directamente en el contenedor backend:
docker compose exec backend npm run test:harness
```

El script ejecuta secuencialmente los 18 escenarios, reporta tiempos de ejecución medidos y retorna un código de salida `0` si todas las pruebas son aprobadas.

### Opción B: Vía Interfaz Web
1. Ingresar a [http://localhost:3000/login](http://localhost:3000/login) con cualquier cuenta autorizada.
2. Navegar a **Harness de Pruebas** ([http://localhost:3000/harness](http://localhost:3000/harness)).
3. Hacer clic en **"Ejecutar Suite Completa (P01 - P18)"** para observar el progreso y los resultados en vivo.

---

## 7. Documentación Técnica del Proyecto

Los detalles exhaustivos solicitados en la rúbrica se encuentran organizados en la carpeta `docs/`:

- [docs/RESOLUCION.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/RESOLUCION.md): Alcance, arquitectura, decisiones técnicas, limitaciones y desglose de la rúbrica de 100 puntos.
- [docs/MODELO.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/MODELO.md): Diagrama Entidad-Relación Mermaid, diccionario de datos, jerarquía CMDB y mapeo de fuentes.
- [docs/PROCESOS.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/PROCESOS.md): Mapeo Diapositiva 14 a los 7 procesos, colas, matriz RBAC, diagramas de estado, concurrencia y soporte L0-L4.
- [docs/IA.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/IA.md): Evidencias verificables de Prompt Engineering (8 prompts + 2 mejoras), Context Engineering (`AGENTS.md`), Harness, Loop (3 ciclos con fallos deliberados) y Graph Engineering.
- [docs/PRUEBAS.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/docs/PRUEBAS.md): Matriz de trazabilidad Requisito $\rightarrow$ Implementación $\rightarrow$ Prueba $\rightarrow$ Evidencia con resultados reales de P01 a P18.
- [AGENTS.md](file:///c:/Users/Enner/Desktop/parcial-catalogo-servicios-202302220/AGENTS.md): Contexto normativo versionado (v2.0.0) y reglas de Data Trust Boundary.

---

## 8. Procedimientos de Apagado y Limpieza

- **Apagado normal conservando datos:**
  ```bash
  docker compose down
  ```
- **Reinicio con limpieza de volúmenes (arranque desde cero):**
  ```bash
  docker compose down -v
  ```