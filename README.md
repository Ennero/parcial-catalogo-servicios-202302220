# Parcial Práctico: Sistema de Gestión del Catálogo de Servicios de TI

**Asignatura:** Software Avanzado — Universidad de San Carlos de Guatemala  
**Estudiante:** Enner (Carné: 202302220)  
**Catedrático Evaluador:** Marco Tulio Aldana Prillwitz (`maldanap-usac`)  
**Fecha de Entrega:** 04 de Octubre 2026, 23:00  
**Versión y Etiqueta:** `parcial-v2.0`  

---

## 1. Descripción del Proyecto

Aplicación web completa y reproducible para la sistematización y gestión del catálogo de servicios de TI de la organización a partir de la hoja de cálculo `CatalogoServicios.xlsx`. La solución incorpora:
- **Estructura Organizacional Jerárquica de 6 niveles** (Empresa → Área → Departamento → Sección → Puesto → Usuario) con política restrictiva de bajas lógicas.
- **Gobernanza bajo ITIL v4 y Matriz RACI** asignando Sección Responsable y Dueño del Servicio (*Service Owner*).
- **Autenticación local y autorización RBAC** para roles `administrador` y `consulta` con algoritmos de hash seguros (Bcrypt) e invalidación de sesiones.
- **Importador de Excel idempotente** con resolución canónica de `SE.12`, soporte de celdas combinadas y preservación de nulos.
- **Doble vía de Harness de Pruebas Automatizadas** que valida los escenarios **P01 a P12** mediante scripts CLI y panel web interactivo.

---

## 2. Requisitos Previos

- **Docker:** Versión 24.0+ o Docker Desktop reciente.
- **Docker Compose:** Versión v2 o superior (`docker compose`).
- *No se requiere instalar Node.js, Python ni MariaDB en la máquina anfitriona.*

---

## 3. Guía de Inicio Rápido (Quickstart)

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/Ennero/parcial-catalogo-servicios-202302220.git
cd parcial-catalogo-servicios-202302220
```

### Paso 2: Configurar Variables de Entorno (Opcional)
El proyecto incluye un archivo `.env.example`. Para la evaluación directa en Docker, Compose ya tiene configuradas las variables por defecto, pero puede copiarse el archivo base:
```bash
cp .env.example .env
```

### Paso 3: Construir y Levantar los Contenedores
Ejecutar el comando estándar solicitado en el enunciado:
```bash
docker compose up --build -d
```

Los servicios se iniciarán en el siguiente orden:
1. `catalogo-mariadb` (MariaDB 11 en puerto `3306` con volumen `mariadb_data`).
2. `catalogo-backend` (NestJS API en puerto `4000`, esperando que MariaDB esté saludable). Al iniciar por primera vez, ejecuta automáticamente los seeds de evaluación y la importación del catálogo.
3. `catalogo-frontend` (Next.js 14 en puerto `3000`).

---

## 4. URLs de Acceso

- **Aplicación Web (Frontend):** [http://localhost:3000](http://localhost:3000)
- **API REST (Backend):** [http://localhost:4000](http://localhost:4000)
- **Panel Interactivo de Pruebas (Harness):** [http://localhost:3000/harness](http://localhost:3000/harness)
- **Visualizador del Catálogo de Servicios:** [http://localhost:3000/catalogo](http://localhost:3000/catalogo)
- **Estructura Organizacional:** [http://localhost:3000/organizacion](http://localhost:3000/organizacion)
- **Importador de Excel:** [http://localhost:3000/importador](http://localhost:3000/importador)

---

## 5. Cuentas de Evaluación de Demostración

| Rol | Correo / Identificador | Contraseña | Unidad / Puesto | Permisos y Propósito |
|---|---|---|---|---|
| **Administrador** | `admin@usac.edu` | `Admin123!` | Jefe de Infraestructura (`PST-JINF`) | Mantenimiento completo de usuarios, organización, catálogos e importación. |
| **Consulta** | `consulta@usac.edu` | `Consulta123!` | Auditor de Redes (`PST-ARED`) | Acceso de solo lectura a datos funcionales; mutaciones bloqueadas en servidor. |
| **Administrador** | `seguridad@usac.edu` | `Seguridad123!` | Oficial CISO (`PST-CISO`) | Pruebas de gobierno en Ciberseguridad y políticas de red. |
| **Administrador** | `devlead@usac.edu` | `DevLead123!` | Líder Técnico Software (`PST-LDEV`) | Pruebas de administración en Sistemas y Aplicaciones. |
| **Consulta** | `soporte@usac.edu` | `Soporte123!` | Mesa de Ayuda N1 (`PST-HD`) | Atención de incidentes HelpDesk y aprovisionamiento. |
| **Consulta** | `analista@usac.edu` | `Analista123!` | Arquitecto de Datos (`PST-DBA`) | Consulta de servicios analíticos y tableros (`SE.12`). |
| **Consulta** | `inactivo@usac.edu` | `Inactivo123!` | Técnico en Archivo (`PST-INAC`) | **Prueba P02:** comprobación inmediata del bloqueo a cuentas desactivadas. |

> **Nota:** La pantalla de inicio de sesión (`/login`) cuenta con botones de autocompletado rápido para facilitar la revisión del evaluador con un solo clic.

---

## 6. Ejecución del Harness de Pruebas (P01 a P12)

### Opción A: Vía Terminal (Recomendado para calificación automatizada)
Ejecutar el script de pruebas:
```bash
./scripts/run_tests.sh
```
O directamente con Docker Compose:
```bash
docker compose exec backend npm test
```

### Opción B: Vía Interfaz Web
1. Iniciar sesión en [http://localhost:3000/login](http://localhost:3000/login).
2. Dirigirse a la sección **Harness de Pruebas** ([http://localhost:3000/harness](http://localhost:3000/harness)).
3. Hacer clic en **"Ejecutar Suite Completa (P01 - P12)"**.
4. Visualizar en tiempo real el porcentaje de éxito, tiempos de respuesta y detalles de cada aserción.

---

## 7. Comandos Adicionales de Mantenimiento

- **Re-ejecutar Importación del Excel manualmente:**
  ```bash
  docker compose exec backend npm run import-excel
  ```
- **Re-ejecutar Seeds de datos de evaluación:**
  ```bash
  docker compose exec backend npm run seed
  ```
- **Consultar logs de contenedores en tiempo real:**
  ```bash
  docker compose logs -f
  ```
- **Apagar el sistema conservando los datos persistidos:**
  ```bash
  docker compose down
  ```
- **Reinicio destructivo (eliminando volúmenes de datos):**
  ```bash
  docker compose down -v
  ```

---

## 8. Documentación Obligatoria

Toda la documentación técnica exigida por la rúbrica se encuentra disponible en formato Markdown:
- **[docs/RESOLUCION.md](docs/RESOLUCION.md):** Informe técnico completo respondiendo a los 10 puntos del enunciado (arquitectura, MER, mapeo Excel, evidencias de IA, matriz de trazabilidad y reflexiones).
- **[docs/CRITERIOS_ACEPTACION.md](docs/CRITERIOS_ACEPTACION.md):** Matriz exhaustiva de criterios de aceptación, correspondencia con la rúbrica de 100 puntos y lista de verificación del recorrido de calificación.
- **[AGENTS.md](AGENTS.md):** Contexto operativo versionado para asistentes de IA, límites de seguridad y regla de frontera de datos.
- **[docs/context/CONTEXT_SPEC.md](docs/context/CONTEXT_SPEC.md):** Especificación de context engineering y justificación de las dos actualizaciones.
- **[docs/prompts/PROMPTS_ENGINEERING.md](docs/prompts/PROMPTS_ENGINEERING.md):** Registro de los 5 prompts reales utilizados y 2 iteraciones de mejora.
- **[docs/harness_evidence/HARNESS_EVIDENCE.md](docs/harness_evidence/HARNESS_EVIDENCE.md):** Registro del entorno de harness y evidencia del ciclo completo de falla $\rightarrow$ corrección $\rightarrow$ éxito.