import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { ServicioN1 } from '../../entities/servicio-n1.entity';
import { ServicioN2 } from '../../entities/servicio-n2.entity';
import { ClaseServicio } from '../../entities/clase-servicio.entity';
import { CriticidadServicio } from '../../entities/criticidad-servicio.entity';
import { TipoServicio } from '../../entities/tipo-servicio.entity';
import { ImportacionLog } from '../../entities/importacion-log.entity';
import { ImportacionObservacion } from '../../entities/importacion-observacion.entity';

@Injectable()
export class ImporterService {
  private readonly logger = new Logger(ImporterService.name);

  constructor(
    @InjectRepository(ServicioN1)
    private readonly s1Repo: Repository<ServicioN1>,
    @InjectRepository(ServicioN2)
    private readonly s2Repo: Repository<ServicioN2>,
    @InjectRepository(ClaseServicio)
    private readonly claseRepo: Repository<ClaseServicio>,
    @InjectRepository(CriticidadServicio)
    private readonly critRepo: Repository<CriticidadServicio>,
    @InjectRepository(TipoServicio)
    private readonly tipoRepo: Repository<TipoServicio>,
    @InjectRepository(ImportacionLog)
    private readonly logRepo: Repository<ImportacionLog>,
    @InjectRepository(ImportacionObservacion)
    private readonly obsRepo: Repository<ImportacionObservacion>,
  ) {}

  async seedAuxiliaryCatalogs() {
    const clases = ['A DEMANDA', 'RECURRENTE'];
    for (const c of clases) {
      const exists = await this.claseRepo.findOne({ where: { nombre: c } });
      if (!exists) await this.claseRepo.save(this.claseRepo.create({ nombre: c }));
    }

    const criticidades = [
      { nombre: 'Very Low', nivel: 1 },
      { nombre: 'Low', nivel: 2 },
      { nombre: 'Normal', nivel: 3 },
      { nombre: 'High', nivel: 4 },
      { nombre: 'Very High', nivel: 5 },
    ];
    for (const cr of criticidades) {
      const exists = await this.critRepo.findOne({ where: { nombre: cr.nombre } });
      if (!exists) await this.critRepo.save(this.critRepo.create(cr));
    }

    const tipos = [
      'Back End',
      'Demostration',
      'End User Service',
      'Front End',
      'IT Management',
      'IT Operational',
      'Other',
      'Project',
      'Reporting',
      'Training',
      'Underpinning Contract',
    ];
    for (const t of tipos) {
      const exists = await this.tipoRepo.findOne({ where: { nombre: t } });
      if (!exists) await this.tipoRepo.save(this.tipoRepo.create({ nombre: t }));
    }
  }

  async importCatalogFromExcel(customFilePath?: string) {
    await this.seedAuxiliaryCatalogs();

    const candidatePaths = [
      customFilePath,
      process.env.EXCEL_PATH,
      path.resolve(process.cwd(), 'data/CatalogoServicios.xlsx'),
      path.resolve(process.cwd(), 'docs/context/CatalogoServicios.xlsx'),
      path.resolve(process.cwd(), '../docs/context/CatalogoServicios.xlsx'),
      path.resolve(process.cwd(), 'docs/CatalogoServicios.xlsx'),
      path.resolve(process.cwd(), '../docs/CatalogoServicios.xlsx'),
    ].filter(Boolean) as string[];

    let targetFile = '';
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        targetFile = p;
        break;
      }
    }

    if (!targetFile) {
      throw new Error(
        `Archivo Excel no encontrado en ninguna de las rutas esperadas: ${candidatePaths.join(', ')}`,
      );
    }

    this.logger.log(`Iniciando importación desde archivo: ${targetFile}`);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(targetFile);

    const ws = workbook.getWorksheet('Servicios Externos');
    if (!ws) {
      throw new Error(`La hoja 'Servicios Externos' no fue encontrada en el archivo.`);
    }

    // Cargar catálogos en memoria para mapeos rápidos
    const clases = await this.claseRepo.find();
    const claseMap = new Map(clases.map((c) => [c.nombre.toUpperCase().trim(), c.id]));

    const criticidades = await this.critRepo.find();
    const critMap = new Map(criticidades.map((c) => [c.nombre.toUpperCase().trim(), c.id]));

    const tipos = await this.tipoRepo.find();
    const tipoMap = new Map(tipos.map((t) => [t.nombre.toUpperCase().trim(), t.id]));

    const observaciones: { fila: number | null; codigo: string | null; tipo: string; mensaje: string }[] = [];

    let currentL1Code: string | null = null;
    let currentL1Name: string | null = null;

    let creadosN1 = 0;
    let creadosN2 = 0;
    let actualizados = 0;
    let omitidos = 0;

    // Procesar filas de datos 5 a 101
    for (let r = 5; r <= 101; r++) {
      const row = ws.getRow(r);
      const cellA = row.getCell(1);
      const cellB = row.getCell(2);
      const cellC = row.getCell(3);

      const valA = cellA.isMerged ? cellA.master.value : cellA.value;
      const valB = cellB.isMerged ? cellB.master.value : cellB.value;

      if (valA) {
        const rawCode = String(valA).trim();
        const rawName = valB ? String(valB).trim() : '';

        // Tratamiento canónico de SE.12
        if (rawCode === 'SE.12') {
          if (rawName && rawName.toLowerCase().includes('tableros')) {
            observaciones.push({
              fila: r,
              codigo: 'SE.12',
              tipo: 'CONFLICTO_SE12',
              mensaje: `Fila ${r}: Código SE.12 presentó discrepancia de nombre ('${rawName}'). Se consolidó bajo el nombre canónico 'Suministrar Analítica' y se mantuvo el alias registrado.`,
            });
          }
          currentL1Code = 'SE.12';
          currentL1Name = 'Suministrar Analítica';
        } else {
          currentL1Code = rawCode;
          currentL1Name = rawName;
        }

        // Upsert Servicio N1
        let s1 = await this.s1Repo.findOne({ where: { codigo: currentL1Code } });
        if (!s1) {
          s1 = this.s1Repo.create({
            codigo: currentL1Code,
            nombre: currentL1Name,
            activo: true,
          });
          await this.s1Repo.save(s1);
          creadosN1++;
        } else if (s1.nombre !== currentL1Name && currentL1Code !== 'SE.12') {
          s1.nombre = currentL1Name;
          await this.s1Repo.save(s1);
          actualizados++;
        }
      }

      // Procesar solo si cellC es celda principal (master o unmerged) y tiene código N2 explícito
      const isSlaveC = cellC.isMerged && cellC.address !== cellC.master.address;
      if (cellC.value && !isSlaveC) {
        const cod2 = String(cellC.value).trim();

        const getVal = (col: number) => {
          const c = row.getCell(col);
          const v = c.isMerged ? c.master.value : c.value;
          return v !== undefined && v !== null ? v : null;
        };

        const nom2 = getVal(4);
        const activoRaw = getVal(5);
        const claseRaw = getVal(6);
        const critRaw = getVal(7);
        const tipoRaw = getVal(8);
        const descRaw = getVal(9);
        const metricaRaw = getVal(10);
        const minRaw = getVal(11);
        const maxRaw = getVal(12);

        // Mapeo de estado activo
        let estadoActivo = 'DESCONOCIDO';
        if (activoRaw) {
          const actStr = String(activoRaw).trim().toUpperCase();
          if (actStr === 'S' || actStr === 'N') {
            estadoActivo = actStr;
          }
        }

        // Mapeo de clase, criticidad y tipo
        const claseId = claseRaw ? claseMap.get(String(claseRaw).toUpperCase().trim()) || null : null;
        const critId = critRaw ? critMap.get(String(critRaw).toUpperCase().trim()) || null : null;
        const tipoId = tipoRaw ? tipoMap.get(String(tipoRaw).toUpperCase().trim()) || null : null;

        // Detección de atributos incompletos (filas 99 a 101)
        if (!claseRaw && !critRaw && !tipoRaw && estadoActivo === 'DESCONOCIDO') {
          observaciones.push({
            fila: r,
            codigo: cod2,
            tipo: 'ATRIBUTOS_INCOMPLETOS',
            mensaje: `Fila ${r} (${cod2}): Atributos de clase, criticidad, tipo y estado ausentes en Excel original. Conservados como nulos/desconocidos sin coerción.`,
          });
        }

        // Umbrales min / max (conservar nulos, no convertir a cero)
        const parseNumber = (val: any): number | null => {
          if (val === null || val === undefined || val === '') return null;
          const num = typeof val === 'number' ? val : parseFloat(String(val));
          return isNaN(num) ? null : num;
        };

        const minimo = parseNumber(minRaw);
        const maximo = parseNumber(maxRaw);

        // Buscar padre N1
        const parentN1 = await this.s1Repo.findOne({ where: { codigo: currentL1Code } });
        if (!parentN1) {
          throw new Error(`Error de integridad: No se encontró el servicio N1 padre '${currentL1Code}' para '${cod2}'.`);
        }

        // Upsert Servicio N2 (Idempotencia)
        let s2 = await this.s2Repo.findOne({ where: { codigo: cod2 } });
        if (!s2) {
          s2 = this.s2Repo.create({
            codigo: cod2,
            nombre: nom2 ? String(nom2).trim() : '',
            estadoActivo,
            descripcion: descRaw ? String(descRaw).trim() : null,
            metrica: metricaRaw ? String(metricaRaw).trim() : null,
            minimo,
            maximo,
            servicioN1Id: parentN1.id,
            claseId,
            criticidadId: critId,
            tipoId,
            activo: true,
          });
          await this.s2Repo.save(s2);
          creadosN2++;
        } else {
          // Actualizar campos manteniendo asignaciones existentes
          let changed = false;
          if (s2.nombre !== (nom2 ? String(nom2).trim() : '')) {
            s2.nombre = nom2 ? String(nom2).trim() : '';
            changed = true;
          }
          if (s2.estadoActivo !== estadoActivo) {
            s2.estadoActivo = estadoActivo;
            changed = true;
          }
          if (s2.claseId !== claseId) {
            s2.claseId = claseId;
            changed = true;
          }
          if (s2.criticidadId !== critId) {
            s2.criticidadId = critId;
            changed = true;
          }
          if (s2.tipoId !== tipoId) {
            s2.tipoId = tipoId;
            changed = true;
          }
          if (s2.minimo !== minimo) {
            s2.minimo = minimo;
            changed = true;
          }
          if (s2.maximo !== maximo) {
            s2.maximo = maximo;
            changed = true;
          }

          if (changed) {
            await this.s2Repo.save(s2);
            actualizados++;
          } else {
            omitidos++;
          }
        }
      }
    }

    const totalN1 = await this.s1Repo.count();
    const totalN2 = await this.s2Repo.count();

    // Guardar registro de auditoría de importación
    const importLog = this.logRepo.create({
      archivo: path.basename(targetFile),
      creadosN1,
      creadosN2,
      actualizados,
      omitidos,
      totalN1,
      totalN2,
    });
    const savedLog = await this.logRepo.save(importLog);

    if (observaciones.length > 0) {
      const obsEntities = observaciones.map((obs) =>
        this.obsRepo.create({
          importacionLogId: savedLog.id,
          fila: obs.fila,
          codigo: obs.codigo,
          tipo: obs.tipo,
          mensaje: obs.mensaje,
        }),
      );
      await this.obsRepo.save(obsEntities);
    }

    this.logger.log(
      `Importación finalizada. Creados N1: ${creadosN1}, Creados N2: ${creadosN2}, Actualizados: ${actualizados}, Omitidos: ${omitidos}. Total en BD -> N1: ${totalN1}, N2: ${totalN2}`,
    );

    return {
      logId: savedLog.id,
      archivo: path.basename(targetFile),
      creadosN1,
      creadosN2,
      actualizados,
      omitidos,
      totalN1,
      totalN2,
      observacionesCount: observaciones.length,
      observaciones,
    };
  }

  async getImportLogs() {
    return this.logRepo.find({
      relations: ['observaciones'],
      order: { fecha: 'DESC' },
      take: 20,
    });
  }
}
