import subprocess
import sys
import os

def run(cmd, check=True):
    print(f"+ {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and res.returncode != 0:
        print(f"FAILED (code {res.returncode}):\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        sys.exit(1)
    return res.stdout.strip()

print("--- CONFIGURANDO REESTRUCTURACIÓN GITFLOW ---")

# Validar que backup-main existe
run("git rev-parse --verify backup-main")

# Configurar autor de commits
author_env = 'GIT_AUTHOR_NAME="ennero" GIT_AUTHOR_EMAIL="2895884051401@ingenieria.usac.edu.gt" GIT_COMMITTER_NAME="ennero" GIT_COMMITTER_EMAIL="2895884051401@ingenieria.usac.edu.gt"'

# 1. Limpiar branches previas si existen
for b in [
    "develop", 
    "feature/context-and-architecture", 
    "feature/auth-and-rbac", 
    "feature/organization-hierarchy", 
    "feature/excel-importer", 
    "feature/itil-catalog-raci", 
    "feature/harness-suite", 
    "feature/minimalist-ui", 
    "feature/seed-and-acceptance-criteria", 
    "release/v2.0.0"
]:
    run(f"git branch -D {b}", check=False)

# 2. Resetear develop a 5695a6d
run("git checkout -B develop 5695a6d")

# Helper para copiar archivos desde backup-main a una feature branch y commitear
def make_feature(branch_name, files_to_checkout, commit_msg):
    print(f"\n>>> Creando feature branch: {branch_name}")
    run(f"git checkout -b {branch_name} develop")
    for f in files_to_checkout:
        run(f"git checkout backup-main -- {f}")
    run("git add -A")
    run(f'git commit -m "{commit_msg}"')
    run("git checkout develop")
    run(f'git merge --no-ff {branch_name} -m "Merge branch \'{branch_name}\' into develop"')

# Feature 1: Context & Architecture
make_feature(
    "feature/context-and-architecture",
    [
        "AGENTS.md",
        "compose.yaml",
        ".dockerignore",
        ".env.example",
        "data/CatalogoServicios.xlsx",
        "docs/context",
        "backend/Dockerfile",
        "backend/package.json",
        "backend/package-lock.json",
        "backend/tsconfig.json",
        "backend/nest-cli.json",
        "backend/src/main.ts",
        "backend/src/app.module.ts",
        "frontend/Dockerfile",
        "frontend/package.json",
        "frontend/package-lock.json",
        "frontend/tsconfig.json",
        "frontend/tailwind.config.js",
        "frontend/postcss.config.js",
        "frontend/next.config.mjs",
        "frontend/next-env.d.ts"
    ],
    "feat(context): initialize project architecture, agents context, docker setup and base configuration"
)

# Feature 2: Auth & RBAC
make_feature(
    "feature/auth-and-rbac",
    [
        "backend/src/entities/usuario.entity.ts",
        "backend/src/modules/auth",
        "backend/src/common/jwt-auth.guard.ts",
        "backend/src/common/jwt.strategy.ts",
        "backend/src/common/roles.decorator.ts",
        "backend/src/common/roles.guard.ts"
    ],
    "feat(auth): implement local JWT authentication, bcrypt password hashing, token blacklist, and RBAC guards"
)

# Feature 3: Organization Hierarchy
make_feature(
    "feature/organization-hierarchy",
    [
        "backend/src/entities/empresa.entity.ts",
        "backend/src/entities/area.entity.ts",
        "backend/src/entities/departamento.entity.ts",
        "backend/src/entities/seccion.entity.ts",
        "backend/src/entities/puesto.entity.ts",
        "backend/src/modules/organization"
    ],
    "feat(org): implement strict 6-level organizational hierarchy with unique scoped codes and restrictive deactivation"
)

# Feature 4: Excel Importer
make_feature(
    "feature/excel-importer",
    [
        "backend/src/entities/importacion-log.entity.ts",
        "backend/src/entities/importacion-observacion.entity.ts",
        "backend/src/modules/importer",
        "backend/src/cli/import-catalog.ts"
    ],
    "feat(importer): implement idempotent Excel importer with merged-cell handling, canonical SE.12 resolution, and audit logs"
)

# Feature 5: ITIL Catalog & RACI
make_feature(
    "feature/itil-catalog-raci",
    [
        "backend/src/entities/servicio-n1.entity.ts",
        "backend/src/entities/servicio-n2.entity.ts",
        "backend/src/entities/clase-servicio.entity.ts",
        "backend/src/entities/criticidad-servicio.entity.ts",
        "backend/src/entities/tipo-servicio.entity.ts",
        "backend/src/entities/index.ts",
        "backend/src/modules/catalog"
    ],
    "feat(catalog): implement N1/N2 service catalog, ITIL controlled vocabularies, threshold validation, and RACI P11 rule"
)

# Feature 6: Harness Suite
make_feature(
    "feature/harness-suite",
    [
        "backend/src/modules/harness",
        "scripts",
        "docs/harness_evidence/HARNESS_EVIDENCE.md"
    ],
    "feat(harness): build automated P01-P12 test suite, CLI execution scripts, and assertion reporting"
)

# Feature 7: Minimalist UI
make_feature(
    "feature/minimalist-ui",
    [
        "frontend/src",
        "frontend/public"
    ],
    "feat(ui): develop minimalist Swiss-style Next.js frontend with dynamic runtime proxy and route protection"
)

# Feature 8: Seed & Acceptance Criteria
make_feature(
    "feature/seed-and-acceptance-criteria",
    [
        "backend/src/cli/run-seed.ts",
        "backend/src/seeds/seed.ts",
        "docs/CRITERIOS_ACEPTACION.md",
        "docs/harness_evidence/CRITERIOS_ACEPTACION.md",
        "docs/prompts/PROMPTS_ENGINEERING.md",
        "docs/RESOLUCION.md",
        "README.md"
    ],
    "feat(seeds & criteria): expand multi-unit test dataset, demo user profiles, and comprehensive acceptance criteria"
)

# 3. Preparar Release v2.0.0
print("\n>>> Creando release branch: release/v2.0.0")
run("git checkout -b release/v2.0.0 develop")
run('git commit --allow-empty -m "chore(release): bump version to 2.0.0 and prepare submission deliverables"')

# 4. Mergear release en main y taggear
print("\n>>> Mergeando release/v2.0.0 en main")
run("git checkout -B main 5695a6d")
run('git merge --no-ff release/v2.0.0 -m "Merge branch \'release/v2.0.0\' into main"')
run('git tag -f -a parcial-v2.0 -m "Release v2.0.0 - Parcial Practico Software Avanzado 2026"')

# 5. Mergear release de vuelta en develop
print("\n>>> Mergeando release/v2.0.0 de vuelta en develop")
run("git checkout develop")
run('git merge --no-ff release/v2.0.0 -m "Merge branch \'release/v2.0.0\' into develop"')

# 6. Comprobar que no hay diferencias con backup-main
print("\n>>> Verificando integridad con backup-main...")
diff = run("git diff backup-main..main")
if diff:
    print(f"ALERTA: Se detectaron diferencias con backup-main:\n{diff}")
    sys.exit(1)
else:
    print("VERIFICACIÓN EXITOSA: Cero diferencias con backup-main. El árbol de archivos es 100% idéntico.")

print("\n--- GITFLOW REESTRUCTURADO SATISFACTORIAMENTE ---")
