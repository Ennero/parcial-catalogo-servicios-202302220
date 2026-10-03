import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Empresa } from '../entities/empresa.entity';
import { Area } from '../entities/area.entity';
import { Departamento } from '../entities/departamento.entity';
import { Seccion } from '../entities/seccion.entity';
import { Puesto } from '../entities/puesto.entity';
import { Usuario, UserRole } from '../entities/usuario.entity';
import { ClaseServicio } from '../entities/clase-servicio.entity';
import { CriticidadServicio } from '../entities/criticidad-servicio.entity';
import { TipoServicio } from '../entities/tipo-servicio.entity';
import { ServicioN1 } from '../entities/servicio-n1.entity';
import { ServicioN2 } from '../entities/servicio-n2.entity';
import { ImportacionLog } from '../entities/importacion-log.entity';
import { ImportacionObservacion } from '../entities/importacion-observacion.entity';
import { ImporterService } from '../modules/importer/importer.service';

export async function runSeeds(dataSource: DataSource) {
  console.log('--- INICIANDO SEEDS DE EVALUACIÓN Y VALORES DE PRUEBA ---');

  const empresaRepo = dataSource.getRepository(Empresa);
  const areaRepo = dataSource.getRepository(Area);
  const deptoRepo = dataSource.getRepository(Departamento);
  const seccionRepo = dataSource.getRepository(Seccion);
  const puestoRepo = dataSource.getRepository(Puesto);
  const usuarioRepo = dataSource.getRepository(Usuario);
  const claseRepo = dataSource.getRepository(ClaseServicio);
  const critRepo = dataSource.getRepository(CriticidadServicio);
  const tipoRepo = dataSource.getRepository(TipoServicio);
  const s1Repo = dataSource.getRepository(ServicioN1);
  const s2Repo = dataSource.getRepository(ServicioN2);
  const logRepo = dataSource.getRepository(ImportacionLog);
  const obsRepo = dataSource.getRepository(ImportacionObservacion);

  // 1. Catálogos controlados auxiliares
  const importerService = new ImporterService(
    s1Repo,
    s2Repo,
    claseRepo,
    critRepo,
    tipoRepo,
    logRepo,
    obsRepo,
  );
  await importerService.seedAuxiliaryCatalogs();

  // -------------------------------------------------------------
  // 2. Estructura Organizacional Jerárquica Enriquecida (6 Niveles)
  // -------------------------------------------------------------

  // === EMPRESA 1: Facultad de Ingeniería (USAC) ===
  let empUsac = await empresaRepo.findOne({ where: { codigo: 'EMP-USAC' } });
  if (!empUsac) {
    empUsac = await empresaRepo.save(
      empresaRepo.create({
        codigo: 'EMP-USAC',
        nombre: 'Facultad de Ingeniería - USAC',
        activo: true,
      }),
    );
  }

  // === EMPRESA 2: Rectoría y Órganos Centrales (USAC) ===
  let empRect = await empresaRepo.findOne({ where: { codigo: 'EMP-RECT' } });
  if (!empRect) {
    empRect = await empresaRepo.save(
      empresaRepo.create({
        codigo: 'EMP-RECT',
        nombre: 'Rectoría y Administración Central - USAC',
        activo: true,
      }),
    );
  }

  // --- ÁREAS ---
  // Área DTI (en EMP-USAC)
  let areaDti = await areaRepo.findOne({ where: { empresaId: empUsac.id, codigo: 'AREA-DTI' } });
  if (!areaDti) {
    areaDti = await areaRepo.save(
      areaRepo.create({
        empresaId: empUsac.id,
        codigo: 'AREA-DTI',
        nombre: 'Dirección de Tecnologías de la Información y Comunicación',
        activo: true,
      }),
    );
  }

  // Área Soporte y Operaciones (en EMP-USAC)
  let areaServ = await areaRepo.findOne({ where: { empresaId: empUsac.id, codigo: 'AREA-SER' } });
  if (!areaServ) {
    areaServ = await areaRepo.save(
      areaRepo.create({
        empresaId: empUsac.id,
        codigo: 'AREA-SER',
        nombre: 'Dirección de Servicios Institucionales y Atención a Usuarios',
        activo: true,
      }),
    );
  }

  // Área Analítica (en EMP-RECT)
  let areaDat = await areaRepo.findOne({ where: { empresaId: empRect.id, codigo: 'AREA-DAT' } });
  if (!areaDat) {
    areaDat = await areaRepo.save(
      areaRepo.create({
        empresaId: empRect.id,
        codigo: 'AREA-DAT',
        nombre: 'Dirección General de Inteligencia Institucional y Datos',
        activo: true,
      }),
    );
  }

  // --- DEPARTAMENTOS ---
  // Depto Infraestructura (en AREA-DTI)
  let deptoSis = await deptoRepo.findOne({ where: { areaId: areaDti.id, codigo: 'DEP-SIS' } });
  if (!deptoSis) {
    deptoSis = await deptoRepo.save(
      deptoRepo.create({
        areaId: areaDti.id,
        codigo: 'DEP-SIS',
        nombre: 'Departamento de Sistemas e Infraestructura de TI',
        activo: true,
      }),
    );
  }

  // Depto Desarrollo (en AREA-DTI)
  let deptoSw = await deptoRepo.findOne({ where: { areaId: areaDti.id, codigo: 'DEP-SW' } });
  if (!deptoSw) {
    deptoSw = await deptoRepo.save(
      deptoRepo.create({
        areaId: areaDti.id,
        codigo: 'DEP-SW',
        nombre: 'Departamento de Desarrollo de Software y Sistemas Académicos',
        activo: true,
      }),
    );
  }

  // Depto Mesa de Ayuda (en AREA-SER)
  let deptoSop = await deptoRepo.findOne({ where: { areaId: areaServ.id, codigo: 'DEP-SOP' } });
  if (!deptoSop) {
    deptoSop = await deptoRepo.save(
      deptoRepo.create({
        areaId: areaServ.id,
        codigo: 'DEP-SOP',
        nombre: 'Departamento de Mesa de Ayuda y Soporte Técnico',
        activo: true,
      }),
    );
  }

  // Depto BI (en AREA-DAT)
  let deptoBi = await deptoRepo.findOne({ where: { areaId: areaDat.id, codigo: 'DEP-BI' } });
  if (!deptoBi) {
    deptoBi = await deptoRepo.save(
      deptoRepo.create({
        areaId: areaDat.id,
        codigo: 'DEP-BI',
        nombre: 'Departamento de Analítica y Tableros Estratégicos',
        activo: true,
      }),
    );
  }

  // --- SECCIONES ---
  // 1. Infraestructura y Redes
  let seccionInf = await seccionRepo.findOne({ where: { departamentoId: deptoSis.id, codigo: 'SEC-INF' } });
  if (!seccionInf) {
    seccionInf = await seccionRepo.save(
      seccionRepo.create({
        departamentoId: deptoSis.id,
        codigo: 'SEC-INF',
        nombre: 'Sección de Infraestructura, Redes y Conectividad',
        activo: true,
      }),
    );
  }

  // 2. Ciberseguridad y Monitoreo SOC
  let seccionSeg = await seccionRepo.findOne({ where: { departamentoId: deptoSis.id, codigo: 'SEC-SEG' } });
  if (!seccionSeg) {
    seccionSeg = await seccionRepo.save(
      seccionRepo.create({
        departamentoId: deptoSis.id,
        codigo: 'SEC-SEG',
        nombre: 'Sección de Ciberseguridad y Monitoreo SOC',
        activo: true,
      }),
    );
  }

  // 3. Desarrollo Web
  let seccionDev = await seccionRepo.findOne({ where: { departamentoId: deptoSw.id, codigo: 'SEC-DEV' } });
  if (!seccionDev) {
    seccionDev = await seccionRepo.save(
      seccionRepo.create({
        departamentoId: deptoSw.id,
        codigo: 'SEC-DEV',
        nombre: 'Sección de Desarrollo y Aplicaciones Web',
        activo: true,
      }),
    );
  }

  // 4. Calidad y QA
  let seccionQa = await seccionRepo.findOne({ where: { departamentoId: deptoSw.id, codigo: 'SEC-QA' } });
  if (!seccionQa) {
    seccionQa = await seccionRepo.save(
      seccionRepo.create({
        departamentoId: deptoSw.id,
        codigo: 'SEC-QA',
        nombre: 'Sección de Calidad y Pruebas de Software (QA)',
        activo: true,
      }),
    );
  }

  // 5. Help Desk
  let seccionHd = await seccionRepo.findOne({ where: { departamentoId: deptoSop.id, codigo: 'SEC-HD' } });
  if (!seccionHd) {
    seccionHd = await seccionRepo.save(
      seccionRepo.create({
        departamentoId: deptoSop.id,
        codigo: 'SEC-HD',
        nombre: 'Sección de Soporte a Usuarios y Mesa de Ayuda',
        activo: true,
      }),
    );
  }

  // 6. Business Intelligence
  let seccionBi = await seccionRepo.findOne({ where: { departamentoId: deptoBi.id, codigo: 'SEC-BI' } });
  if (!seccionBi) {
    seccionBi = await seccionRepo.save(
      seccionRepo.create({
        departamentoId: deptoBi.id,
        codigo: 'SEC-BI',
        nombre: 'Sección de Analítica de Datos y Tableros',
        activo: true,
      }),
    );
  }

  // --- PUESTOS ---
  // Puestos en SEC-INF
  let puestoAdmin = await puestoRepo.findOne({ where: { seccionId: seccionInf.id, codigo: 'PST-JINF' } });
  if (!puestoAdmin) {
    puestoAdmin = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionInf.id,
        codigo: 'PST-JINF',
        nombre: 'Jefe de Infraestructura de TI',
        activo: true,
      }),
    );
  }

  let puestoConsulta = await puestoRepo.findOne({ where: { seccionId: seccionInf.id, codigo: 'PST-ARED' } });
  if (!puestoConsulta) {
    puestoConsulta = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionInf.id,
        codigo: 'PST-ARED',
        nombre: 'Especialista de Monitoreo y Redes',
        activo: true,
      }),
    );
  }

  // Puestos en SEC-SEG
  let puestoCiso = await puestoRepo.findOne({ where: { seccionId: seccionSeg.id, codigo: 'PST-CISO' } });
  if (!puestoCiso) {
    puestoCiso = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionSeg.id,
        codigo: 'PST-CISO',
        nombre: 'Oficial de Seguridad de la Información (CISO)',
        activo: true,
      }),
    );
  }

  let puestoSoc = await puestoRepo.findOne({ where: { seccionId: seccionSeg.id, codigo: 'PST-ANSEC' } });
  if (!puestoSoc) {
    puestoSoc = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionSeg.id,
        codigo: 'PST-ANSEC',
        nombre: 'Analista de Operaciones de Ciberseguridad (SOC)',
        activo: true,
      }),
    );
  }

  // Puestos en SEC-DEV
  let puestoDevLead = await puestoRepo.findOne({ where: { seccionId: seccionDev.id, codigo: 'PST-LDEV' } });
  if (!puestoDevLead) {
    puestoDevLead = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionDev.id,
        codigo: 'PST-LDEV',
        nombre: 'Líder Técnico de Arquitectura de Software',
        activo: true,
      }),
    );
  }

  let puestoDev = await puestoRepo.findOne({ where: { seccionId: seccionDev.id, codigo: 'PST-DEV' } });
  if (!puestoDev) {
    puestoDev = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionDev.id,
        codigo: 'PST-DEV',
        nombre: 'Desarrollador Full Stack',
        activo: true,
      }),
    );
  }

  // Puestos en SEC-QA
  let puestoQa = await puestoRepo.findOne({ where: { seccionId: seccionQa.id, codigo: 'PST-QA' } });
  if (!puestoQa) {
    puestoQa = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionQa.id,
        codigo: 'PST-QA',
        nombre: 'Ingeniero de Calidad y Pruebas Automatizadas',
        activo: true,
      }),
    );
  }

  // Puestos en SEC-HD
  let puestoHd = await puestoRepo.findOne({ where: { seccionId: seccionHd.id, codigo: 'PST-HD' } });
  if (!puestoHd) {
    puestoHd = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionHd.id,
        codigo: 'PST-HD',
        nombre: 'Especialista de Mesa de Ayuda y Soporte Nivel 1',
        activo: true,
      }),
    );
  }

  let puestoInactivo = await puestoRepo.findOne({ where: { seccionId: seccionHd.id, codigo: 'PST-INAC' } });
  if (!puestoInactivo) {
    puestoInactivo = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionHd.id,
        codigo: 'PST-INAC',
        nombre: 'Técnico de Soporte en Archivo Histórico',
        activo: true,
      }),
    );
  }

  // Puestos en SEC-BI
  let puestoBi = await puestoRepo.findOne({ where: { seccionId: seccionBi.id, codigo: 'PST-DBA' } });
  if (!puestoBi) {
    puestoBi = await puestoRepo.save(
      puestoRepo.create({
        seccionId: seccionBi.id,
        codigo: 'PST-DBA',
        nombre: 'Arquitecto de Datos y BI',
        activo: true,
      }),
    );
  }

  // -------------------------------------------------------------
  // 3. Usuarios de Evaluación y Pruebas (RBAC + Contraseñas Hash)
  // -------------------------------------------------------------
  const salt = await bcrypt.genSalt(10);

  // Helper para crear o actualizar usuario de prueba
  const ensureUser = async (
    email: string,
    username: string,
    nombre: string,
    plainPassword: string,
    rol: UserRole,
    activo: boolean,
    puestoId: number,
  ) => {
    let usr = await usuarioRepo.findOne({ where: { email } });
    if (!usr) {
      usr = await usuarioRepo.save(
        usuarioRepo.create({
          nombre,
          username,
          email,
          passwordHash: await bcrypt.hash(plainPassword, salt),
          rol,
          activo,
          puestoId,
        }),
      );
      console.log(`Usuario creado: ${email} (${rol}) [Activo: ${activo}]`);
    }
    return usr;
  };

  // Cuentas Fundamentales de Evaluación (Requeridas por P01, P02, P03)
  const userAdmin = await ensureUser('admin@usac.edu', 'admin', 'Administrador General', 'Admin123!', UserRole.ADMINISTRADOR, true, puestoAdmin.id);
  const userConsulta = await ensureUser('consulta@usac.edu', 'consulta', 'Auditor de Consulta', 'Consulta123!', UserRole.CONSULTA, true, puestoConsulta.id);
  const userDevLead = await ensureUser('devlead@usac.edu', 'devlead', 'Ingeniero Líder de Aplicaciones', 'DevLead123!', UserRole.ADMINISTRADOR, true, puestoDevLead.id);

  // Cuentas Complementarias de Prueba
  const userSeg = await ensureUser('seguridad@usac.edu', 'seguridad', 'Oficial de Seguridad TI', 'Seguridad123!', UserRole.ADMINISTRADOR, true, puestoCiso.id);
  const userSoc = await ensureUser('soc@usac.edu', 'soc', 'Analista Centro Operaciones SOC', 'Soc123!', UserRole.CONSULTA, true, puestoSoc.id);
  const userDev = await ensureUser('dev@usac.edu', 'dev', 'Desarrollador de Aplicaciones', 'Dev123!', UserRole.CONSULTA, true, puestoDev.id);
  const userQa = await ensureUser('qa@usac.edu', 'qa', 'Especialista en Aseguramiento de Calidad', 'Qa123!', UserRole.CONSULTA, true, puestoQa.id);
  const userSoporte = await ensureUser('soporte@usac.edu', 'soporte', 'Técnico de Mesa de Ayuda', 'Soporte123!', UserRole.CONSULTA, true, puestoHd.id);
  const userAnalista = await ensureUser('analista@usac.edu', 'analista', 'Arquitecto de Analítica y Tableros', 'Analista123!', UserRole.CONSULTA, true, puestoBi.id);

  // Usuario Inactivo de Prueba para verificar Escenario P02 en la interfaz
  const userInactivo = await ensureUser('inactivo@usac.edu', 'inactivo', 'Usuario Inactivo de Demostración', 'Inactivo123!', UserRole.CONSULTA, false, puestoInactivo.id);

  // -------------------------------------------------------------
  // 4. Importar Catálogo desde Excel (Garantizando 12 N1 y 46 N2)
  // -------------------------------------------------------------
  console.log('Importando catálogo de servicios desde Excel...');
  await importerService.importCatalogFromExcel();

  // -------------------------------------------------------------
  // 5. Configurar Asignaciones RACI y Umbrales en Servicios N2
  // -------------------------------------------------------------
  console.log('Configurando asignaciones RACI y umbrales representativos...');

  const assignRaci = async (codigo: string, seccionId: number, usuarioId: number, minimo?: number, maximo?: number, metrica?: string) => {
    const s2 = await s2Repo.findOne({ where: { codigo } });
    if (s2) {
      s2.seccionResponsableId = seccionId;
      s2.usuarioResponsableId = usuarioId;
      if (minimo !== undefined) s2.minimo = minimo;
      if (maximo !== undefined) s2.maximo = maximo;
      if (metrica) s2.metrica = metrica;
      await s2Repo.save(s2);
    }
  };

  // Asignaciones en Infraestructura (SEC-INF)
  await assignRaci('SE.01.01', seccionInf.id, userAdmin.id, 99.0, 99.9, '% Disponibilidad de Red');
  await assignRaci('SE.01.02', seccionInf.id, userAdmin.id, 98.5, 99.8, '% Continuidad Eléctrica');
  await assignRaci('SE.01.03', seccionInf.id, userConsulta.id, 95.0, 100.0, '% Cobertura Cámaras CCTV');
  await assignRaci('SE.02.01', seccionInf.id, userConsulta.id, 99.5, 99.9, '% Uptime Enlaces Core');
  await assignRaci('SE.02.02', seccionInf.id, userAdmin.id, 100, 1000, 'Mbps Ancho de Banda');
  await assignRaci('SE.04.01', seccionInf.id, userAdmin.id, 99.5, 99.95, '% Disponibilidad Servidor Correo');

  // Asignaciones en Ciberseguridad (SEC-SEG)
  await assignRaci('SE.02.03', seccionSeg.id, userSeg.id, 10, 250, 'Túneles VPN Simultáneos');
  await assignRaci('SE.08.03', seccionSeg.id, userSeg.id, 1, 24, 'Horas Aprobación Accesos VPN');
  await assignRaci('SE.08.05', seccionSeg.id, userSoc.id, 5, 60, 'Minutos Bloqueo Cuenta Comprometida');

  // Asignaciones en Desarrollo Web (SEC-DEV)
  await assignRaci('SE.06.01', seccionDev.id, userDevLead.id, 1, 14, 'Días Resolución de Solicitud');
  await assignRaci('SE.06.02', seccionDev.id, userDev.id, 2, 20, 'Días Despliegue en Staging');

  // Asignaciones en Calidad y QA (SEC-QA)
  await assignRaci('SE.06.03', seccionQa.id, userQa.id, 85, 100, '% Cobertura de Pruebas Automatizadas');

  // Asignaciones en Mesa de Ayuda (SEC-HD)
  await assignRaci('SE.03.01', seccionHd.id, userSoporte.id, 10, 60, 'Minutos Primer Contacto HelpDesk');
  await assignRaci('SE.09.01', seccionHd.id, userSoporte.id, 1, 5, 'Días Aprovisionamiento Computadora');

  // Asignaciones en Business Intelligence (SEC-BI)
  await assignRaci('SE.12.1', seccionBi.id, userAnalista.id, 1, 24, 'Horas Frecuencia Refresco Tableros');
  await assignRaci('SE.12.2', seccionBi.id, userAnalista.id, 2, 48, 'Horas Entrega Análisis de Información');

  console.log('--- SEEDS Y VALORES DE PRUEBA COMPLETADOS CON ÉXITO ---');
}
