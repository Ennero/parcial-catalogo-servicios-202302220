import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  ColaAtencion,
  ColaUsuario,
  ColaRol,
  Usuario,
  UserRole,
  Ticket,
  TicketBitacora,
  ProcesoServiceDesk,
} from '../../entities';
import {
  CreateColaDto,
  UpdateColaDto,
  AsignarUsuarioColaDto,
  AsignarRolColaDto,
} from './dto/queue.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(ColaAtencion)
    private readonly colaRepo: Repository<ColaAtencion>,
    @InjectRepository(ColaUsuario)
    private readonly colaUsuarioRepo: Repository<ColaUsuario>,
    @InjectRepository(ColaRol)
    private readonly colaRolRepo: Repository<ColaRol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketBitacora)
    private readonly bitacoraRepo: Repository<TicketBitacora>,
  ) {}

  // ---------------------------------------------------------------------------
  // 1. Inicialización de las 7 Colas Obligatorias
  // ---------------------------------------------------------------------------
  async seedDefaultQueues(): Promise<{ total: number; message: string }> {
    const existing = await this.colaRepo.count();
    if (existing >= 7) {
      return { total: existing, message: 'Colas obligatorias ya inicializadas' };
    }

    const colasBase: Array<Partial<ColaAtencion>> = [
      {
        codigo: 'COLA-NUEVOS-SRV',
        nombre: 'Mesa de Análisis de Nuevos Servicios TI',
        descripcion: 'Evaluación de necesidad, viabilidad y catalogación de nuevos servicios de TI',
        proceso: 'nuevos_servicios',
        nivelSoporte: 3,
        slaMinutosPrimeraAtencion: 120,
        slaMinutosResolucion: 1440,
        tipoTiempo: 'habil',
        reglaOrdenamiento: 'prioridad_antiguedad',
        politicaAsignacion: 'manual',
        activo: true,
      },
      {
        codigo: 'COLA-CAMBIOS',
        nombre: 'Comité Asesor de Cambios (CAB)',
        descripcion: 'Evaluación de impacto, riesgo, aprobación y supervisión de ventanas de cambio',
        proceso: 'cambios',
        nivelSoporte: 3,
        slaMinutosPrimeraAtencion: 60,
        slaMinutosResolucion: 720,
        tipoTiempo: 'habil',
        reglaOrdenamiento: 'prioridad_antiguedad',
        politicaAsignacion: 'manual',
        activo: true,
      },
      {
        codigo: 'COLA-INC-L1',
        nombre: 'Service Desk - Incidentes Nivel 1',
        descripcion: 'Recepción, diagnóstico rápido y recuperación de servicios con interrupción o degradación',
        proceso: 'incidentes',
        nivelSoporte: 1,
        slaMinutosPrimeraAtencion: 15,
        slaMinutosResolucion: 180,
        tipoTiempo: 'calendario',
        reglaOrdenamiento: 'prioridad_antiguedad',
        politicaAsignacion: 'manual',
        activo: true,
      },
      {
        codigo: 'COLA-EVENTOS',
        nombre: 'Centro de Operaciones de Red (NOC) - Eventos',
        descripcion: 'Gestión y filtrado de eventos monitoreados E0 a E3 y disparador de incidentes',
        proceso: 'eventos',
        nivelSoporte: 1,
        slaMinutosPrimeraAtencion: 10,
        slaMinutosResolucion: 60,
        tipoTiempo: 'calendario',
        reglaOrdenamiento: 'prioridad_antiguedad',
        politicaAsignacion: 'automatica',
        activo: true,
      },
      {
        codigo: 'COLA-PROBLEMAS',
        nombre: 'Gestión de Problemas y Causa Raíz',
        descripcion: 'Investigación de causa raíz, errores conocidos (KEDB) y soluciones definitivas',
        proceso: 'problemas',
        nivelSoporte: 2,
        slaMinutosPrimeraAtencion: 240,
        slaMinutosResolucion: 2880,
        tipoTiempo: 'habil',
        reglaOrdenamiento: 'prioridad_antiguedad',
        politicaAsignacion: 'manual',
        activo: true,
      },
      {
        codigo: 'COLA-ACCESOS',
        nombre: 'Gestión de Identidades y Accesos (IAM)',
        descripcion: 'Solicitud y provisión de credenciales, roles y permisos institucionales',
        proceso: 'accesos',
        nivelSoporte: 1,
        slaMinutosPrimeraAtencion: 30,
        slaMinutosResolucion: 240,
        tipoTiempo: 'habil',
        reglaOrdenamiento: 'prioridad_antiguedad',
        politicaAsignacion: 'manual',
        activo: true,
      },
      {
        codigo: 'COLA-SERVICIOS-TI',
        nombre: 'Atención a Solicitudes de Servicio TI',
        descripcion: 'Atención y cumplimiento de requerimientos sobre servicios existentes del catálogo',
        proceso: 'servicios_ti',
        nivelSoporte: 1,
        slaMinutosPrimeraAtencion: 60,
        slaMinutosResolucion: 480,
        tipoTiempo: 'habil',
        reglaOrdenamiento: 'prioridad_antiguedad',
        politicaAsignacion: 'manual',
        activo: true,
      },
    ];

    for (const c of colasBase) {
      const exists = await this.colaRepo.findOne({ where: { codigo: c.codigo } });
      if (!exists) {
        await this.colaRepo.save(this.colaRepo.create(c));
      }
    }

    const total = await this.colaRepo.count();
    return { total, message: 'Colas para los 7 procesos ITIL inicializadas con éxito' };
  }

  // ---------------------------------------------------------------------------
  // 2. Consultas y CRUD de Colas
  // ---------------------------------------------------------------------------
  async getColas(): Promise<any[]> {
    const colas = await this.colaRepo.find({
      order: { id: 'ASC' },
    });

    const resultados = [];
    for (const cola of colas) {
      const [usuarios, roles, ticketsActivos] = await Promise.all([
        this.colaUsuarioRepo.find({
          where: { colaId: cola.id },
          relations: ['usuario'],
        }),
        this.colaRolRepo.find({ where: { colaId: cola.id } }),
        this.ticketRepo.count({
          where: {
            colaId: cola.id,
            estado: In(['nuevo', 'asignado', 'en_progreso', 'en_espera']),
          },
        }),
      ]);

      resultados.push({
        ...cola,
        usuariosAsignados: usuarios,
        rolesAsignados: roles,
        ticketsActivos,
      });
    }

    return resultados;
  }

  async getColaById(id: number): Promise<any> {
    const cola = await this.colaRepo.findOne({ where: { id } });
    if (!cola) throw new NotFoundException(`Cola ID ${id} no encontrada`);

    const [usuarios, roles, ticketsActivos] = await Promise.all([
      this.colaUsuarioRepo.find({
        where: { colaId: id },
        relations: ['usuario'],
      }),
      this.colaRolRepo.find({ where: { colaId: id } }),
      this.ticketRepo.count({
        where: {
          colaId: id,
          estado: In(['nuevo', 'asignado', 'en_progreso', 'en_espera']),
        },
      }),
    ]);

    return {
      ...cola,
      usuariosAsignados: usuarios,
      rolesAsignados: roles,
      ticketsActivos,
    };
  }

  async createCola(dto: CreateColaDto): Promise<ColaAtencion> {
    const existing = await this.colaRepo.findOne({ where: { codigo: dto.codigo } });
    if (existing) {
      throw new ConflictException(`Ya existe una cola con el código ${dto.codigo}`);
    }

    const cola = this.colaRepo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      proceso: dto.proceso,
      nivelSoporte: dto.nivelSoporte,
      slaMinutosPrimeraAtencion: dto.slaMinutosPrimeraAtencion ?? 60,
      slaMinutosResolucion: dto.slaMinutosResolucion ?? 480,
      tipoTiempo: dto.tipoTiempo ?? 'habil',
      reglaOrdenamiento: dto.reglaOrdenamiento ?? 'prioridad_antiguedad',
      politicaAsignacion: dto.politicaAsignacion ?? 'manual',
      activo: dto.activo ?? true,
    });

    return this.colaRepo.save(cola);
  }

  // Desactivación restrictiva: impide dejar tickets huérfanos
  async updateCola(id: number, dto: UpdateColaDto, actor?: Usuario): Promise<ColaAtencion> {
    const cola = await this.colaRepo.findOne({ where: { id } });
    if (!cola) throw new NotFoundException(`Cola ID ${id} no encontrada`);

    // Si se está solicitando desactivar la cola
    if (dto.activo === false && cola.activo === true) {
      const ticketsActivos = await this.ticketRepo.count({
        where: {
          colaId: id,
          estado: In(['nuevo', 'asignado', 'en_progreso', 'en_espera']),
        },
      });

      if (ticketsActivos > 0) {
        if (!dto.colaReasignacionId) {
          throw new BadRequestException(
            `No es posible desactivar la cola "${cola.nombre}" porque contiene ${ticketsActivos} tickets activos. ` +
              `Debe especificar una cola de destino ("colaReasignacionId") para reasignar los tickets y no dejarlos huérfanos.`,
          );
        }

        const colaDestino = await this.colaRepo.findOne({ where: { id: dto.colaReasignacionId } });
        if (!colaDestino || !colaDestino.activo) {
          throw new BadRequestException(`La cola de reasignación ID ${dto.colaReasignacionId} no existe o está inactiva`);
        }

        if (colaDestino.proceso !== cola.proceso) {
          throw new BadRequestException(
            `La cola de reasignación debe pertenecer al mismo proceso (${cola.proceso}). ` +
              `La cola seleccionada opera sobre ${colaDestino.proceso}.`,
          );
        }

        // Reasignar los tickets a la nueva cola y dejar registro en bitácora
        const tickets = await this.ticketRepo.find({
          where: {
            colaId: id,
            estado: In(['nuevo', 'asignado', 'en_progreso', 'en_espera']),
          },
        });

        for (const t of tickets) {
          t.colaId = colaDestino.id;
          await this.ticketRepo.save(t);

          await this.bitacoraRepo.save(
            this.bitacoraRepo.create({
              ticketId: t.id,
              actorId: actor?.id ?? null,
              actorNombre: actor?.nombre ?? 'Sistema / Administrador',
              accion: 'TRANSFERENCIA',
              campoModificado: 'colaId',
              valorAnterior: cola.nombre,
              valorNuevo: colaDestino.nombre,
              motivo: `Transferencia automática obligatoria por desactivación de la cola origen "${cola.nombre}".`,
            }),
          );
        }
      }
    }

    Object.assign(cola, {
      nombre: dto.nombre ?? cola.nombre,
      descripcion: dto.descripcion !== undefined ? dto.descripcion : cola.descripcion,
      nivelSoporte: dto.nivelSoporte ?? cola.nivelSoporte,
      slaMinutosPrimeraAtencion: dto.slaMinutosPrimeraAtencion ?? cola.slaMinutosPrimeraAtencion,
      slaMinutosResolucion: dto.slaMinutosResolucion ?? cola.slaMinutosResolucion,
      tipoTiempo: dto.tipoTiempo ?? cola.tipoTiempo,
      reglaOrdenamiento: dto.reglaOrdenamiento ?? cola.reglaOrdenamiento,
      politicaAsignacion: dto.politicaAsignacion ?? cola.politicaAsignacion,
      activo: dto.activo !== undefined ? dto.activo : cola.activo,
    });

    return this.colaRepo.save(cola);
  }

  // ---------------------------------------------------------------------------
  // 3. Asignación de Usuarios y Roles a Colas con Protección del Rol Consulta
  // ---------------------------------------------------------------------------
  async asignarUsuarioACola(dto: AsignarUsuarioColaDto): Promise<ColaUsuario> {
    const [cola, usuario] = await Promise.all([
      this.colaRepo.findOne({ where: { id: dto.colaId } }),
      this.usuarioRepo.findOne({ where: { id: dto.usuarioId } }),
    ]);

    if (!cola) throw new NotFoundException(`Cola ID ${dto.colaId} no encontrada`);
    if (!usuario) throw new NotFoundException(`Usuario ID ${dto.usuarioId} no encontrado`);

    // Protección estricta del rol consulta:
    // "Los permisos del rol de consulta no deben elevarse accidentalmente por pertenecer a una cola. Controle la autorización en el servidor."
    const esSoloConsulta =
      usuario.rol === UserRole.CONSULTA &&
      (!usuario.rolesSecundarios || !usuario.rolesSecundarios.includes('agente'));

    let puedeAtender = dto.puedeAtender ?? true;
    let puedeTransferir = dto.puedeTransferir ?? true;
    let puedeAprobar = dto.puedeAprobar ?? false;
    let puedeAdministrar = dto.puedeAdministrar ?? false;

    if (esSoloConsulta) {
      puedeAtender = false;
      puedeTransferir = false;
      puedeAprobar = false;
      puedeAdministrar = false;
    }

    let colaUser = await this.colaUsuarioRepo.findOne({
      where: { colaId: dto.colaId, usuarioId: dto.usuarioId },
    });

    if (colaUser) {
      colaUser.puedeConsultar = dto.puedeConsultar ?? true;
      colaUser.puedeAtender = puedeAtender;
      colaUser.puedeTransferir = puedeTransferir;
      colaUser.puedeAprobar = puedeAprobar;
      colaUser.puedeAdministrar = puedeAdministrar;
      return this.colaUsuarioRepo.save(colaUser);
    }

    colaUser = this.colaUsuarioRepo.create({
      colaId: dto.colaId,
      usuarioId: dto.usuarioId,
      puedeConsultar: dto.puedeConsultar ?? true,
      puedeAtender,
      puedeTransferir,
      puedeAprobar,
      puedeAdministrar,
    });

    return this.colaUsuarioRepo.save(colaUser);
  }

  async asignarRolACola(dto: AsignarRolColaDto): Promise<ColaRol> {
    const cola = await this.colaRepo.findOne({ where: { id: dto.colaId } });
    if (!cola) throw new NotFoundException(`Cola ID ${dto.colaId} no encontrada`);

    let puedeAtender = dto.puedeAtender ?? false;
    let puedeTransferir = dto.puedeTransferir ?? false;
    let puedeAprobar = dto.puedeAprobar ?? false;
    let puedeAdministrar = dto.puedeAdministrar ?? false;

    // Si el rol es 'consulta', jamás puede atender, transferir o aprobar
    if (dto.rol === 'consulta') {
      puedeAtender = false;
      puedeTransferir = false;
      puedeAprobar = false;
      puedeAdministrar = false;
    }

    let colaRol = await this.colaRolRepo.findOne({
      where: { colaId: dto.colaId, rol: dto.rol },
    });

    if (colaRol) {
      colaRol.puedeConsultar = dto.puedeConsultar ?? true;
      colaRol.puedeAtender = puedeAtender;
      colaRol.puedeTransferir = puedeTransferir;
      colaRol.puedeAprobar = puedeAprobar;
      colaRol.puedeAdministrar = puedeAdministrar;
      return this.colaRolRepo.save(colaRol);
    }

    colaRol = this.colaRolRepo.create({
      colaId: dto.colaId,
      rol: dto.rol,
      puedeConsultar: dto.puedeConsultar ?? true,
      puedeAtender,
      puedeTransferir,
      puedeAprobar,
      puedeAdministrar,
    });

    return this.colaRolRepo.save(colaRol);
  }

  // ---------------------------------------------------------------------------
  // 4. Verificación de Permisos Efectivos en Servidor (P06)
  // ---------------------------------------------------------------------------
  async verificarPermiso(
    usuario: Usuario,
    colaId: number,
    accion: 'consultar' | 'atender' | 'transferir' | 'aprobar' | 'administrar',
  ): Promise<boolean> {
    // 1. Administrador siempre tiene todos los permisos
    if (usuario.rol === UserRole.ADMINISTRADOR) return true;

    // 2. Usuario con rol consulta estricto NUNCA puede realizar acciones operativas o de aprobación
    const esSoloConsulta =
      usuario.rol === UserRole.CONSULTA &&
      (!usuario.rolesSecundarios ||
        (!usuario.rolesSecundarios.includes('agente') && !usuario.rolesSecundarios.includes('aprobador')));

    if (esSoloConsulta && accion !== 'consultar') {
      return false;
    }

    // 3. Revisar asignación específica de usuario en la cola
    const asignacionUsuario = await this.colaUsuarioRepo.findOne({
      where: { colaId, usuarioId: usuario.id },
    });

    if (asignacionUsuario) {
      switch (accion) {
        case 'consultar':
          return asignacionUsuario.puedeConsultar;
        case 'atender':
          return asignacionUsuario.puedeAtender;
        case 'transferir':
          return asignacionUsuario.puedeTransferir;
        case 'aprobar':
          return asignacionUsuario.puedeAprobar;
        case 'administrar':
          return asignacionUsuario.puedeAdministrar;
      }
    }

    // 4. Revisar si su rol principal o roles secundarios tienen permiso en la cola
    const rolesToCheck = [usuario.rol as string];
    if (usuario.rolesSecundarios) {
      rolesToCheck.push(...usuario.rolesSecundarios.split(',').map((r) => r.trim()));
    }

    const asignacionesRol = await this.colaRolRepo.find({
      where: { colaId, rol: In(rolesToCheck) },
    });

    for (const r of asignacionesRol) {
      switch (accion) {
        case 'consultar':
          if (r.puedeConsultar) return true;
          break;
        case 'atender':
          if (r.puedeAtender) return true;
          break;
        case 'transferir':
          if (r.puedeTransferir) return true;
          break;
        case 'aprobar':
          if (r.puedeAprobar) return true;
          break;
        case 'administrar':
          if (r.puedeAdministrar) return true;
          break;
      }
    }

    return false;
  }
}
