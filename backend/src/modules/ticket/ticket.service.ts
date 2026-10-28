import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Between } from 'typeorm';
import {
  Ticket,
  TicketComentario,
  TicketAdjunto,
  TicketBitacora,
  TicketRelacion,
  TicketCi,
  FaqArticulo,
  Usuario,
  UserRole,
  ServicioN1,
  ServicioN2,
  ColaAtencion,
  CmdbCi,
  EstadoTicket,
  TipoTicket,
  PrioridadTicket,
} from '../../entities';
import {
  CreateTicketDto,
  UpdateEstadoTicketDto,
  TransferirTicketDto,
  ReabrirTicketDto,
  CreateComentarioDto,
  RelacionarTicketsDto,
  CreateFaqDto,
} from './dto/ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketComentario)
    private readonly comentarioRepo: Repository<TicketComentario>,
    @InjectRepository(TicketAdjunto)
    private readonly adjuntoRepo: Repository<TicketAdjunto>,
    @InjectRepository(TicketBitacora)
    private readonly bitacoraRepo: Repository<TicketBitacora>,
    @InjectRepository(TicketRelacion)
    private readonly relacionRepo: Repository<TicketRelacion>,
    @InjectRepository(TicketCi)
    private readonly ticketCiRepo: Repository<TicketCi>,
    @InjectRepository(FaqArticulo)
    private readonly faqRepo: Repository<FaqArticulo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(ServicioN1)
    private readonly s1Repo: Repository<ServicioN1>,
    @InjectRepository(ServicioN2)
    private readonly s2Repo: Repository<ServicioN2>,
    @InjectRepository(ColaAtencion)
    private readonly colaRepo: Repository<ColaAtencion>,
    @InjectRepository(CmdbCi)
    private readonly ciRepo: Repository<CmdbCi>,
  ) {}

  // ---------------------------------------------------------------------------
  // 1. Creación de Tickets con Validación de Referencias (P05)
  // ---------------------------------------------------------------------------
  async createTicket(dto: CreateTicketDto, creador: Usuario): Promise<Ticket> {
    // 1. Validar solicitante
    const solicitante = await this.usuarioRepo.findOne({
      where: { id: dto.solicitanteId, activo: true },
    });
    if (!solicitante) {
      throw new BadRequestException(`El solicitante ID ${dto.solicitanteId} no existe o está inactivo`);
    }

    // 2. Validar servicio N2 y derivar servicio N1
    const s2 = await this.s2Repo.findOne({
      where: { id: dto.servicioN2Id, activo: true },
      relations: ['servicioN1'],
    });
    if (!s2) {
      throw new BadRequestException(`El servicio N2 ID ${dto.servicioN2Id} no existe o está inactivo`);
    }
    const servicioN1Id = s2.servicioN1Id;

    // 3. Validar cola
    const cola = await this.colaRepo.findOne({ where: { id: dto.colaId, activo: true } });
    if (!cola) {
      throw new BadRequestException(`La cola ID ${dto.colaId} no existe o está inactiva`);
    }

    // 4. Generar correlativo único
    const count = await this.ticketRepo.count();
    const numero = `TK-2026-${(count + 1).toString().padStart(5, '0')}`;

    // 5. Validar CIs y registrar justificante si no lleva CI
    let sinCiJustificacion = dto.sinCiJustificacion ?? null;
    if ((!dto.ciIds || dto.ciIds.length === 0) && !sinCiJustificacion) {
      sinCiJustificacion = 'Trámite puramente lógico o de gestión que no involucra un CI físico individual.';
    }

    const ticket = this.ticketRepo.create({
      numero,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      solicitanteId: solicitante.id,
      creadorId: creador.id,
      servicioN2Id: s2.id,
      servicioN1Id,
      tipo: dto.tipo,
      proceso: dto.proceso,
      colaId: cola.id,
      estado: 'nuevo',
      prioridad: dto.prioridad ?? 'media',
      impacto: dto.impacto ?? 'medio',
      urgencia: dto.urgencia ?? 'media',
      canal: dto.canal ?? 'portal',
      sinCiJustificacion,
      metadataProceso: dto.metadataProceso ? JSON.stringify(dto.metadataProceso) : null,
    });

    const savedTicket = await this.ticketRepo.save(ticket);

    // Guardar CIs asociados si se enviaron
    if (dto.ciIds && dto.ciIds.length > 0) {
      const cisValidos = await this.ciRepo.find({ where: { id: In(dto.ciIds) } });
      if (cisValidos.length !== dto.ciIds.length) {
        throw new BadRequestException('Uno o más CIs especificados no existen en la CMDB');
      }
      for (const ci of cisValidos) {
        await this.ticketCiRepo.save(
          this.ticketCiRepo.create({
            ticketId: savedTicket.id,
            ciId: ci.id,
            impactoEnCi: 'Elemento directamente involucrado en la solicitud',
          }),
        );
      }
    }

    // Registrar bitácora inmutable de creación
    await this.bitacoraRepo.save(
      this.bitacoraRepo.create({
        ticketId: savedTicket.id,
        actorId: creador.id,
        actorNombre: creador.nombre,
        accion: 'CREACION',
        campoModificado: 'estado',
        valorAnterior: null,
        valorNuevo: 'nuevo',
        motivo: `Ticket registrado exitosamente bajo el proceso de ${dto.proceso}`,
      }),
    );

    // Automatismo de Eventos (P11): Si es un evento E2 o E3, generar o vincular incidente
    if (dto.proceso === 'eventos' && dto.metadataProceso) {
      const catEvento = dto.metadataProceso.categoriaEvento;
      if (catEvento === 'E2' || catEvento === 'E3') {
        await this.procesarIncidenteParaEvento(savedTicket, catEvento, creador);
      }
    }

    return this.getTicketById(savedTicket.id);
  }

  // ---------------------------------------------------------------------------
  // 2. Control de Concurrencia al Reclamar Ticket (P07)
  // ---------------------------------------------------------------------------
  async tomarTicketConcurrente(ticketId: number, agente: Usuario): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['cola'],
    });

    if (!ticket) throw new NotFoundException(`Ticket ID ${ticketId} no encontrado`);

    // Intentar actualización atómica con condición WHERE para evitar carrera entre dos agentes
    const resultado = await this.ticketRepo
      .createQueryBuilder()
      .update(Ticket)
      .set({
        responsableId: agente.id,
        estado: 'asignado',
        fechaAsignacion: new Date(),
      })
      .where('id = :id AND (responsableId IS NULL OR estado = :estNuevo)', {
        id: ticketId,
        estNuevo: 'nuevo',
      })
      .execute();

    if (resultado.affected === 0) {
      throw new ConflictException(
        'Conflicto de concurrencia: el ticket ya ha sido tomado o asignado a otro agente.',
      );
    }

    // Registrar en bitácora
    await this.bitacoraRepo.save(
      this.bitacoraRepo.create({
        ticketId,
        actorId: agente.id,
        actorNombre: agente.nombre,
        accion: 'ASIGNACION',
        campoModificado: 'responsableId',
        valorAnterior: 'Sin asignar',
        valorNuevo: agente.nombre,
        motivo: `Ticket tomado por el agente ${agente.nombre} desde la cola "${ticket.cola.nombre}".`,
      }),
    );

    return this.getTicketById(ticketId);
  }

  // ---------------------------------------------------------------------------
  // 3. Transiciones de Estados y Validaciones por Proceso (P09, P10, P15)
  // ---------------------------------------------------------------------------
  async cambiarEstado(
    ticketId: number,
    dto: UpdateEstadoTicketDto,
    actor: Usuario,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['cola', 'solicitante'],
    });

    if (!ticket) throw new NotFoundException(`Ticket ID ${ticketId} no encontrado`);

    const estadoAnterior = ticket.estado;
    const nuevo = dto.nuevoEstado;

    // Validación 1: Gestión de Cambios (P10)
    // Prohibido ejecutar sin aprobación del CAB
    if (ticket.proceso === 'cambios' && (nuevo === 'en_progreso' || nuevo === 'resuelto')) {
      const meta = ticket.metadataProceso ? JSON.parse(ticket.metadataProceso) : {};
      if (!meta.aprobado) {
        throw new BadRequestException(
          'Operación rechazada (P10): No se permite la ejecución ni resolución de una solicitud de cambio sin previa aprobación formal del CAB.',
        );
      }
    }

    // Validación 2: Gestión de Accesos (P10)
    // Impedir estrictamente la autoaprobación del solicitante
    if (ticket.proceso === 'accesos' && nuevo === 'aprobado') {
      if (actor.id === ticket.solicitanteId) {
        throw new BadRequestException(
          'Operación rechazada (P10): Conflicto de interés. Se impide estrictamente la autoaprobación de accesos por parte del propio solicitante.',
        );
      }
    }

    // Validación 3: Cierre sin resolución (P15)
    // Rechazar cierre si no cuenta con solución aplicada registrada
    if ((nuevo === 'resuelto' || nuevo === 'cerrado') && !ticket.solucionAplicada && !dto.solucionAplicada) {
      throw new BadRequestException(
        'Operación rechazada (P15): No es posible resolver o cerrar el ticket sin especificar detalladamente la solución técnica o administrativa aplicada.',
      );
    }

    // Actualizar timestamps operativos
    const ahora = new Date();
    if (!ticket.fechaPrimeraRespuesta && (nuevo === 'en_progreso' || nuevo === 'asignado')) {
      ticket.fechaPrimeraRespuesta = ahora;
    }
    if (nuevo === 'resuelto') {
      ticket.fechaResolucion = ahora;
    }
    if (nuevo === 'cerrado') {
      ticket.fechaCierre = ahora;
    }

    if (dto.solucionAplicada) {
      ticket.solucionAplicada = dto.solucionAplicada;
    }

    if (dto.metadataAdicional) {
      const actual = ticket.metadataProceso ? JSON.parse(ticket.metadataProceso) : {};
      ticket.metadataProceso = JSON.stringify({ ...actual, ...dto.metadataAdicional });
    }

    ticket.estado = nuevo;
    await this.ticketRepo.save(ticket);

    // Registro inmutable en bitácora
    await this.bitacoraRepo.save(
      this.bitacoraRepo.create({
        ticketId,
        actorId: actor.id,
        actorNombre: actor.nombre,
        accion: 'CAMBIO_ESTADO',
        campoModificado: 'estado',
        valorAnterior: estadoAnterior,
        valorNuevo: nuevo,
        motivo: dto.motivo ?? `Transición de estado hacia ${nuevo}`,
      }),
    );

    return this.getTicketById(ticketId);
  }

  // ---------------------------------------------------------------------------
  // 4. Transferencia Entre Colas (P08)
  // ---------------------------------------------------------------------------
  async transferirTicket(
    ticketId: number,
    dto: TransferirTicketDto,
    actor: Usuario,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['cola'],
    });

    if (!ticket) throw new NotFoundException(`Ticket ID ${ticketId} no encontrado`);

    const colaDestino = await this.colaRepo.findOne({
      where: { id: dto.nuevaColaId, activo: true },
    });

    if (!colaDestino) {
      throw new BadRequestException(`La cola de destino ID ${dto.nuevaColaId} no existe o está inactiva`);
    }

    if (ticket.colaId === colaDestino.id) {
      throw new BadRequestException('El ticket ya se encuentra asignado a la cola indicada');
    }

    const colaAnteriorNombre = ticket.cola.nombre;
    ticket.colaId = colaDestino.id;
    ticket.cola = colaDestino;
    ticket.proceso = colaDestino.proceso; // Alineación con el proceso de la nueva cola

    await this.ticketRepo.save(ticket);

    // Registrar en bitácora con motivo y actor
    await this.bitacoraRepo.save(
      this.bitacoraRepo.create({
        ticketId,
        actorId: actor.id,
        actorNombre: actor.nombre,
        accion: 'TRANSFERENCIA',
        campoModificado: 'colaId',
        valorAnterior: colaAnteriorNombre,
        valorNuevo: colaDestino.nombre,
        motivo: dto.motivo,
      }),
    );

    return this.getTicketById(ticketId);
  }

  // ---------------------------------------------------------------------------
  // 5. Reapertura Controlada y Bitácora (P15)
  // ---------------------------------------------------------------------------
  async reabrirTicket(ticketId: number, dto: ReabrirTicketDto, actor: Usuario): Promise<Ticket> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ID ${ticketId} no encontrado`);

    if (ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado') {
      throw new BadRequestException(
        `Solo es posible reabrir tickets que se encuentren en estado "resuelto" o "cerrado". Estado actual: "${ticket.estado}".`,
      );
    }

    const estadoAnterior = ticket.estado;
    ticket.estado = 'en_progreso';
    ticket.fechaReapertura = new Date();
    ticket.motivoReapertura = dto.motivo;

    await this.ticketRepo.save(ticket);

    await this.bitacoraRepo.save(
      this.bitacoraRepo.create({
        ticketId,
        actorId: actor.id,
        actorNombre: actor.nombre,
        accion: 'REAPERTURA',
        campoModificado: 'estado',
        valorAnterior: estadoAnterior,
        valorNuevo: 'en_progreso',
        motivo: dto.motivo,
      }),
    );

    return this.getTicketById(ticketId);
  }

  // ---------------------------------------------------------------------------
  // 6. Vinculación de Tickets (Incidente <-> Problema <-> Cambio) (P13)
  // ---------------------------------------------------------------------------
  async relacionarTickets(
    ticketOrigenId: number,
    dto: RelacionarTicketsDto,
    actor: Usuario,
  ): Promise<TicketRelacion> {
    if (ticketOrigenId === dto.ticketDestinoId) {
      throw new BadRequestException('Un ticket no puede relacionarse consigo mismo');
    }

    const [t1, t2] = await Promise.all([
      this.ticketRepo.findOne({ where: { id: ticketOrigenId } }),
      this.ticketRepo.findOne({ where: { id: dto.ticketDestinoId } }),
    ]);

    if (!t1) throw new NotFoundException(`Ticket de origen ID ${ticketOrigenId} no existe`);
    if (!t2) throw new NotFoundException(`Ticket de destino ID ${dto.ticketDestinoId} no existe`);

    const existing = await this.relacionRepo.findOne({
      where: {
        ticketOrigenId,
        ticketDestinoId: dto.ticketDestinoId,
        tipoRelacion: dto.tipoRelacion,
      },
    });

    if (existing) return existing;

    const rel = this.relacionRepo.create({
      ticketOrigenId,
      ticketDestinoId: dto.ticketDestinoId,
      tipoRelacion: dto.tipoRelacion,
      descripcion: dto.descripcion ?? null,
    });

    const savedRel = await this.relacionRepo.save(rel);

    // Dejar bitácora en ambos tickets
    await Promise.all([
      this.bitacoraRepo.save(
        this.bitacoraRepo.create({
          ticketId: t1.id,
          actorId: actor.id,
          actorNombre: actor.nombre,
          accion: 'VINCULACION_TICKET',
          campoModificado: 'relaciones',
          valorAnterior: null,
          valorNuevo: `${t2.numero} (${dto.tipoRelacion})`,
          motivo: dto.descripcion ?? 'Vinculación de trazabilidad entre tickets',
        }),
      ),
      this.bitacoraRepo.save(
        this.bitacoraRepo.create({
          ticketId: t2.id,
          actorId: actor.id,
          actorNombre: actor.nombre,
          accion: 'VINCULACION_TICKET',
          campoModificado: 'relaciones',
          valorAnterior: null,
          valorNuevo: `${t1.numero} (${dto.tipoRelacion})`,
          motivo: dto.descripcion ?? 'Vinculación de trazabilidad entre tickets',
        }),
      ),
    ]);

    return savedRel;
  }

  // ---------------------------------------------------------------------------
  // 7. Automatismo de Eventos E2/E3 disparando Incidentes (P11)
  // ---------------------------------------------------------------------------
  private async procesarIncidenteParaEvento(
    eventoTicket: Ticket,
    categoriaEvento: string,
    actor: Usuario,
  ): Promise<void> {
    // Buscar la cola de incidentes
    const colaIncidentes = await this.colaRepo.findOne({
      where: { proceso: 'incidentes', activo: true },
    });
    if (!colaIncidentes) return;

    // Verificar si ya existe incidente vinculado para no duplicar
    const yaVinculado = await this.relacionRepo.findOne({
      where: { ticketOrigenId: eventoTicket.id, tipoRelacion: 'genera_incidente' },
    });
    if (yaVinculado) return;

    const count = await this.ticketRepo.count();
    const numeroInc = `TK-2026-${(count + 1).toString().padStart(5, '0')}`;

    const catIncidente = categoriaEvento === 'E3' ? 'I6' : 'I2';
    const prioridadInc: PrioridadTicket = categoriaEvento === 'E3' ? 'muy_alta' : 'alta';

    const incTicket = this.ticketRepo.create({
      numero: numeroInc,
      titulo: `[Incidente Automático por ${categoriaEvento}] ${eventoTicket.titulo}`,
      descripcion: `Incidente originado automáticamente tras evaluación de evento no programado ${categoriaEvento} (${eventoTicket.numero}):\n${eventoTicket.descripcion}`,
      solicitanteId: eventoTicket.solicitanteId,
      creadorId: actor.id,
      servicioN2Id: eventoTicket.servicioN2Id,
      servicioN1Id: eventoTicket.servicioN1Id,
      tipo: 'incidente',
      proceso: 'incidentes',
      colaId: colaIncidentes.id,
      estado: 'nuevo',
      prioridad: prioridadInc,
      impacto: categoriaEvento === 'E3' ? 'alto' : 'medio',
      urgencia: 'alta',
      canal: 'monitoreo',
      metadataProceso: JSON.stringify({
        categoriaIncidente: catIncidente,
        interrupcionODegradacion: 'interrupcion',
        eventoOrigenId: eventoTicket.id,
        notificacionEnviada: true,
      }),
    });

    const savedInc = await this.ticketRepo.save(incTicket);

    // Vincular ambos tickets
    await this.relacionRepo.save(
      this.relacionRepo.create({
        ticketOrigenId: eventoTicket.id,
        ticketDestinoId: savedInc.id,
        tipoRelacion: 'genera_incidente',
        descripcion: `Incidente disparado automáticamente por evento ${categoriaEvento}`,
      }),
    );

    // Registrar bitácora en ambos tickets
    await this.bitacoraRepo.save([
      this.bitacoraRepo.create({
        ticketId: eventoTicket.id,
        actorId: actor.id,
        actorNombre: 'Monitor de Eventos Automático',
        accion: 'NOTIFICACION_INCIDENTE',
        campoModificado: 'incidenteAsociado',
        valorAnterior: null,
        valorNuevo: savedInc.numero,
        motivo: `Generación y notificación verificable de incidente por evento ${categoriaEvento}`,
      }),
      this.bitacoraRepo.create({
        ticketId: savedInc.id,
        actorId: actor.id,
        actorNombre: 'Monitor de Eventos Automático',
        accion: 'CREACION_AUTOMATICA',
        campoModificado: 'eventoOrigen',
        valorAnterior: null,
        valorNuevo: eventoTicket.numero,
        motivo: `Incidente creado automáticamente derivado del evento ${categoriaEvento}`,
      }),
    ]);
  }

  // ---------------------------------------------------------------------------
  // 8. Comentarios (Públicos vs Notas Internas)
  // ---------------------------------------------------------------------------
  async addComentario(ticketId: number, dto: CreateComentarioDto, autor: Usuario): Promise<TicketComentario> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException(`Ticket ID ${ticketId} no encontrado`);

    const com = this.comentarioRepo.create({
      ticketId,
      autorId: autor.id,
      contenido: dto.contenido,
      esNotaInterna: dto.esNotaInterna ?? false,
    });

    const saved = await this.comentarioRepo.save(com);

    await this.bitacoraRepo.save(
      this.bitacoraRepo.create({
        ticketId,
        actorId: autor.id,
        actorNombre: autor.nombre,
        accion: dto.esNotaInterna ? 'NOTA_INTERNA' : 'COMENTARIO_PUBLICO',
        campoModificado: 'comentarios',
        valorAnterior: null,
        valorNuevo: dto.esNotaInterna ? '[Nota Interna Confidencial]' : dto.contenido.slice(0, 100),
        motivo: dto.esNotaInterna
          ? 'Nota interna registrada para el equipo técnico'
          : 'Comentario visible para el solicitante',
      }),
    );

    return saved;
  }

  // ---------------------------------------------------------------------------
  // 9. Consultas, Filtros, Paginación y Permisos de Visualización
  // ---------------------------------------------------------------------------
  async getTickets(
    filtros: {
      page?: number;
      limit?: number;
      search?: string;
      proceso?: string;
      colaId?: number;
      estado?: string;
      prioridad?: string;
      responsableId?: number;
      solicitanteId?: number;
      servicioN2Id?: number;
    },
    usuarioActual: Usuario,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Number(filtros.page) || 1;
    const limit = Math.min(Number(filtros.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.solicitante', 'solicitante')
      .leftJoinAndSelect('t.creador', 'creador')
      .leftJoinAndSelect('t.servicioN2', 'servicioN2')
      .leftJoinAndSelect('t.servicioN1', 'servicioN1')
      .leftJoinAndSelect('t.cola', 'cola')
      .leftJoinAndSelect('t.responsable', 'responsable');

    // Regla de vista por rol:
    // El solicitante puro solo puede ver sus propios tickets
    const esSoloSolicitante =
      usuarioActual.rol === UserRole.SOLICITANTE ||
      (usuarioActual.rol !== UserRole.ADMINISTRADOR &&
        usuarioActual.rol !== UserRole.CONSULTA &&
        (!usuarioActual.rolesSecundarios ||
          (!usuarioActual.rolesSecundarios.includes('agente') &&
            !usuarioActual.rolesSecundarios.includes('administrador'))));

    if (esSoloSolicitante) {
      qb.andWhere('(t.solicitanteId = :uid OR t.creadorId = :uid)', { uid: usuarioActual.id });
    }

    if (filtros.search) {
      qb.andWhere('(t.numero LIKE :s OR t.titulo LIKE :s OR t.descripcion LIKE :s)', {
        s: `%${filtros.search}%`,
      });
    }

    if (filtros.proceso) {
      qb.andWhere('t.proceso = :proc', { proc: filtros.proceso });
    }

    if (filtros.colaId) {
      qb.andWhere('t.colaId = :cid', { cid: filtros.colaId });
    }

    if (filtros.estado) {
      qb.andWhere('t.estado = :est', { est: filtros.estado });
    }

    if (filtros.prioridad) {
      qb.andWhere('t.prioridad = :prio', { prio: filtros.prioridad });
    }

    if (filtros.responsableId) {
      qb.andWhere('t.responsableId = :rid', { rid: filtros.responsableId });
    }

    if (filtros.servicioN2Id) {
      qb.andWhere('t.servicioN2Id = :sid', { sid: filtros.servicioN2Id });
    }

    qb.orderBy('t.id', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTicketById(id: number, usuarioActual?: Usuario): Promise<any> {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: [
        'solicitante',
        'creador',
        'servicioN2',
        'servicioN1',
        'cola',
        'responsable',
      ],
    });

    if (!ticket) throw new NotFoundException(`Ticket ID ${id} no encontrado`);

    // Comentarios filtrados: solicitantes no ven notas internas
    const esSolicitante =
      usuarioActual &&
      usuarioActual.rol === UserRole.SOLICITANTE &&
      (!usuarioActual.rolesSecundarios || !usuarioActual.rolesSecundarios.includes('agente'));

    const comentariosQuery = this.comentarioRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.autor', 'autor')
      .where('c.ticketId = :tid', { tid: id });

    if (esSolicitante) {
      comentariosQuery.andWhere('c.esNotaInterna = false');
    }

    comentariosQuery.orderBy('c.createdAt', 'ASC');
    const comentarios = await comentariosQuery.getMany();

    // CIs asociados
    const ticketCis = await this.ticketCiRepo.find({
      where: { ticketId: id },
      relations: ['ci', 'ci.categoria'],
    });

    // Bitácora completa
    const bitacora = await this.bitacoraRepo.find({
      where: { ticketId: id },
      order: { fecha: 'ASC' },
    });

    // Relaciones entre tickets
    const relacionesSalientes = await this.relacionRepo.find({
      where: { ticketOrigenId: id },
      relations: ['ticketDestino'],
    });

    const relacionesEntrantes = await this.relacionRepo.find({
      where: { ticketDestinoId: id },
      relations: ['ticketOrigen'],
    });

    return {
      ...ticket,
      metadataParsed: ticket.metadataProceso ? JSON.parse(ticket.metadataProceso) : null,
      comentarios,
      elementosConfiguracion: ticketCis.map((tc) => ({
        ci: tc.ci,
        impactoEnCi: tc.impactoEnCi,
      })),
      bitacora,
      relacionesSalientes,
      relacionesEntrantes,
    };
  }

  // ---------------------------------------------------------------------------
  // 10. Base de Conocimiento y FAQ (Nivel 0 - Autoservicio)
  // ---------------------------------------------------------------------------
  async getFaqs(search?: string): Promise<FaqArticulo[]> {
    const qb = this.faqRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.servicioN2', 'servicioN2')
      .where('f.activo = :act', { act: true });

    if (search) {
      qb.andWhere('(f.titulo LIKE :s OR f.contenido LIKE :s OR f.categoria LIKE :s)', {
        s: `%${search}%`,
      });
    }

    qb.orderBy('f.utilCount', 'DESC').addOrderBy('f.visitas', 'DESC');
    return qb.getMany();
  }

  async createFaq(dto: CreateFaqDto): Promise<FaqArticulo> {
    const faq = this.faqRepo.create(dto);
    return this.faqRepo.save(faq);
  }

  async marcarUtilFaq(id: number): Promise<FaqArticulo> {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException(`Artículo FAQ ID ${id} no encontrado`);
    faq.utilCount += 1;
    return this.faqRepo.save(faq);
  }

  // ---------------------------------------------------------------------------
  // 11. Tablero de Control e Indicadores SLA (P17)
  // ---------------------------------------------------------------------------
  async getDashboardMetrics(): Promise<{
    totalTickets: number;
    porEstado: Record<string, number>;
    porProceso: Record<string, number>;
    porPrioridad: Record<string, number>;
    porCola: Array<{ colaId: number; nombre: string; total: number; abiertos: number }>;
    promedioPrimeraAtencionMinutos: number;
    promedioResolucionMinutos: number;
    cumplimientoSlaPorcentaje: number;
    ticketsAbiertosEnPausa: number;
  }> {
    const tickets = await this.ticketRepo.find({ relations: ['cola'] });

    const totalTickets = tickets.length;
    const porEstado: Record<string, number> = {};
    const porProceso: Record<string, number> = {};
    const porPrioridad: Record<string, number> = {};

    let totalPrimeraAtencion = 0;
    let countConPrimeraAtencion = 0;
    let totalResolucion = 0;
    let countConResolucion = 0;
    let dentroDeSla = 0;
    let evaluadosSla = 0;
    let ticketsAbiertosEnPausa = 0;

    const colaMap = new Map<number, { colaId: number; nombre: string; total: number; abiertos: number }>();

    for (const t of tickets) {
      porEstado[t.estado] = (porEstado[t.estado] || 0) + 1;
      porProceso[t.proceso] = (porProceso[t.proceso] || 0) + 1;
      porPrioridad[t.prioridad] = (porPrioridad[t.prioridad] || 0) + 1;

      if (t.estado === 'en_espera') {
        ticketsAbiertosEnPausa += 1;
      }

      if (t.cola) {
        const c = colaMap.get(t.cola.id) || {
          colaId: t.cola.id,
          nombre: t.cola.nombre,
          total: 0,
          abiertos: 0,
        };
        c.total += 1;
        if (['nuevo', 'asignado', 'en_progreso', 'en_espera'].includes(t.estado)) {
          c.abiertos += 1;
        }
        colaMap.set(t.cola.id, c);
      }

      // Cálculo de primera respuesta
      if (t.fechaPrimeraRespuesta) {
        const minResp = Math.max(
          1,
          Math.round((t.fechaPrimeraRespuesta.getTime() - t.fechaCreacion.getTime()) / 60000),
        );
        totalPrimeraAtencion += minResp;
        countConPrimeraAtencion += 1;

        if (t.cola) {
          evaluadosSla += 1;
          if (minResp <= t.cola.slaMinutosPrimeraAtencion) {
            dentroDeSla += 1;
          }
        }
      }

      // Cálculo de resolución
      if (t.fechaResolucion) {
        const minRes = Math.max(
          1,
          Math.round((t.fechaResolucion.getTime() - t.fechaCreacion.getTime()) / 60000),
        );
        totalResolucion += minRes;
        countConResolucion += 1;
      }
    }

    return {
      totalTickets,
      porEstado,
      porProceso,
      porPrioridad,
      porCola: Array.from(colaMap.values()),
      promedioPrimeraAtencionMinutos:
        countConPrimeraAtencion > 0 ? Math.round(totalPrimeraAtencion / countConPrimeraAtencion) : 0,
      promedioResolucionMinutos:
        countConResolucion > 0 ? Math.round(totalResolucion / countConResolucion) : 0,
      cumplimientoSlaPorcentaje:
        evaluadosSla > 0 ? Math.round((dentroDeSla / evaluadosSla) * 100) : 100,
      ticketsAbiertosEnPausa,
    };
  }

  // ---------------------------------------------------------------------------
  // 12. Generación de Tickets de Demostración (Al menos 35 tickets)
  // ---------------------------------------------------------------------------
  async seedDemoTickets(): Promise<{ total: number; message: string }> {
    const existing = await this.ticketRepo.count();
    if (existing >= 35) {
      return { total: existing, message: 'Tickets de demostración ya existen' };
    }

    const [admin, usuarios, colas, serviciosN2, cis] = await Promise.all([
      this.usuarioRepo.findOne({ where: { rol: UserRole.ADMINISTRADOR } }),
      this.usuarioRepo.find({ where: { activo: true } }),
      this.colaRepo.find({ where: { activo: true } }),
      this.s2Repo.find({ where: { activo: true }, relations: ['servicioN1'] }),
      this.ciRepo.find({ take: 20 }),
    ]);

    if (!admin || colas.length === 0 || serviciosN2.length === 0) {
      return { total: 0, message: 'Faltan datos base (usuarios, colas o catálogo) para generar tickets demo' };
    }

    const colasPorProceso = new Map<string, ColaAtencion>();
    colas.forEach((c) => colasPorProceso.set(c.proceso, c));

    const procesos = [
      'nuevos_servicios',
      'cambios',
      'incidentes',
      'eventos',
      'problemas',
      'accesos',
      'servicios_ti',
    ];

    let contadorCreados = 0;

    for (const proc of procesos) {
      const cola = colasPorProceso.get(proc) || colas[0];

      for (let i = 1; i <= 5; i++) {
        const srv = serviciosN2[(contadorCreados + i) % serviciosN2.length];
        const solicitante = usuarios[i % usuarios.length];
        const agente = usuarios[(i + 1) % usuarios.length];

        let titulo = '';
        let desc = '';
        let tipo: TipoTicket = 'requisicion_servicio';
        let estado: EstadoTicket = 'nuevo';
        let metadata: any = {};
        const ciAsociado = cis.length > 0 ? cis[(contadorCreados + i) % cis.length] : null;

        switch (proc) {
          case 'nuevos_servicios':
            tipo = 'requisicion_servicio';
            titulo = `Solicitud de Nuevo Servicio: Plataforma de Inteligencia Artificial para Investigación #${i}`;
            desc = `Propuesta formal para habilitar clúster GPU y soporte para proyectos de grado.`;
            estado = i === 1 ? 'nuevo' : i === 2 ? 'en_progreso' : i === 3 ? 'aprobado' : 'resuelto';
            metadata = { viabilidad: 'Alta', impactoInstitucional: 'Docencia e Investigación' };
            break;

          case 'cambios':
            tipo = 'solicitud_cambio';
            titulo = `RFC-2026: Actualización de Firmware y Parches de Seguridad en Servidor Central #${i}`;
            desc = `Ventana de mantenimiento programada para actualizar SO y base de datos relacional.`;
            estado = i === 1 ? 'nuevo' : i === 2 ? 'en_progreso' : i === 3 ? 'aprobado' : 'resuelto';
            metadata = {
              evaluacionImpacto: 'Medio',
              evaluacionRiesgo: 'Bajo con redundancia',
              planPruebas: 'Validación de login y consultas de catálogo tras reinicio',
              planReversion: 'Restauración de snapshot de máquina virtual previa a la ventana',
              aprobado: i >= 3,
            };
            break;

          case 'incidentes':
            tipo = 'incidente';
            const catI = `I${(i % 7)}`;
            titulo = `Incidente ${catI}: Degradación de velocidad y latencia en portal estudiantil #${i}`;
            desc = `Usuarios reportan demoras al consultar estados académicos.`;
            estado = i === 1 ? 'nuevo' : i === 2 ? 'asignado' : i === 3 ? 'en_progreso' : 'resuelto';
            metadata = {
              categoriaIncidente: catI,
              interrupcionODegradacion: i % 2 === 0 ? 'interrupcion' : 'degradacion',
              duracionEstimadaMinutos: 60 * i,
              redundanciaDisponible: true,
            };
            break;

          case 'eventos':
            tipo = 'evento';
            const catE = `E${(i % 4)}`;
            titulo = `Evento Monitoreo ${catE}: Umbral de utilización de memoria superado #${i}`;
            desc = `Alerta capturada por agente SNMP en servidor de producción.`;
            estado = i === 1 ? 'nuevo' : 'resuelto';
            metadata = {
              categoriaEvento: catE,
              notificacionEnviada: catE === 'E2' || catE === 'E3',
            };
            break;

          case 'problemas':
            tipo = 'problema';
            titulo = `Investigación de Causa Raíz: Caídas intermitentes en la red Wi-Fi Campus #${i}`;
            desc = `Múltiples incidentes recibidos en el último mes relativos a desconexiones en edificio T3.`;
            estado = i === 1 ? 'nuevo' : i === 2 ? 'en_progreso' : 'resuelto';
            metadata = {
              causaRaiz: 'Saturación en canal de 2.4 GHz e interferencia por estructura física',
              solucionTemporal: 'Rebalanceo manual hacia banda de 5 GHz',
              errorConocido: true,
            };
            break;

          case 'accesos':
            tipo = 'solicitud_acceso';
            titulo = `Solicitud de Permisos: Acceso al Sistema de Calificaciones y Actas #${i}`;
            desc = `Requerimiento de acceso con perfil de Administrador Docente para nuevo catedrático.`;
            estado = i === 1 ? 'nuevo' : i === 2 ? 'asignado' : i === 3 ? 'aprobado' : 'resuelto';
            metadata = {
              beneficiarioId: solicitante.id,
              beneficiarioNombre: solicitante.nombre,
              recursoOServicio: 'Portal Académico Web',
              permisoRequerido: 'Escritura y Firma Digital',
              aprobado: i >= 3,
            };
            break;

          case 'servicios_ti':
            tipo = 'requisicion_servicio';
            titulo = `Petición de Servicio TI: Configuración de buzón de correo institucional #${i}`;
            desc = `Creación de alias de correo para unidad de investigación.`;
            estado = i === 1 ? 'nuevo' : i === 2 ? 'asignado' : 'resuelto';
            break;
        }

        const ahora = new Date();
        const fechaCreacion = new Date(ahora.getTime() - (35 - contadorCreados) * 3600000);

        const ticket = this.ticketRepo.create({
          numero: `TK-2026-${(contadorCreados + 1).toString().padStart(5, '0')}`,
          titulo,
          descripcion: desc,
          solicitanteId: solicitante.id,
          creadorId: admin.id,
          servicioN2Id: srv.id,
          servicioN1Id: srv.servicioN1Id,
          tipo,
          proceso: proc as any,
          colaId: cola.id,
          responsableId: estado !== 'nuevo' ? agente.id : null,
          estado,
          prioridad: i % 2 === 0 ? 'alta' : 'media',
          impacto: 'medio',
          urgencia: 'media',
          canal: 'portal',
          sinCiJustificacion: ciAsociado ? null : 'Trámite lógico sin elemento físico asociado.',
          metadataProceso: JSON.stringify(metadata),
          fechaCreacion,
          fechaActualizacion: ahora,
          fechaAsignacion: estado !== 'nuevo' ? new Date(fechaCreacion.getTime() + 15 * 60000) : null,
          fechaPrimeraRespuesta:
            estado !== 'nuevo' ? new Date(fechaCreacion.getTime() + 25 * 60000) : null,
          fechaResolucion: estado === 'resuelto' ? ahora : null,
          fechaCierre: (estado as string) === 'cerrado' ? ahora : null,
          solucionAplicada:
            (estado as string) === 'resuelto' || (estado as string) === 'cerrado'
              ? 'Atención completada satisfactoriamente con validación del usuario.'
              : null,
        });

        const saved = await this.ticketRepo.save(ticket);
        contadorCreados += 1;

        if (ciAsociado) {
          await this.ticketCiRepo.save(
            this.ticketCiRepo.create({
              ticketId: saved.id,
              ciId: ciAsociado.id,
              impactoEnCi: 'Dispositivo directamente vinculado en demostración',
            }),
          );
        }

        // Bitácora inicial
        await this.bitacoraRepo.save(
          this.bitacoraRepo.create({
            ticketId: saved.id,
            actorId: admin.id,
            actorNombre: admin.nombre,
            accion: 'CREACION_DEMO',
            campoModificado: 'estado',
            valorAnterior: null,
            valorNuevo: estado,
            motivo: `Ticket de demostración generado para el proceso de ${proc}`,
            fecha: fechaCreacion,
          }),
        );
      }
    }

    // Inicializar FAQs base
    await this.seedFaqs();

    const totalFinal = await this.ticketRepo.count();
    return {
      total: totalFinal,
      message: `Se crearon ${contadorCreados} tickets de demostración (5 por cada uno de los 7 procesos)`,
    };
  }

  private async seedFaqs(): Promise<void> {
    const existing = await this.faqRepo.count();
    if (existing > 0) return;

    const faqs = [
      {
        titulo: '¿Cómo solicitar una cuenta de correo institucional?',
        categoria: 'Cuentas y Accesos',
        contenido:
          'Ingrese a la sección de Gestión de Accesos del portal de Service Desk, seleccione su unidad académica e indique su número de carné o DPI. El trámite requiere validación de su coordinador.',
        visitas: 142,
        utilCount: 88,
      },
      {
        titulo: '¿Qué hacer si la red Wi-Fi institucional no conecta?',
        categoria: 'Redes y Telecomunicaciones',
        contenido:
          'Asegúrese de seleccionar la red "USAC-Campus" y utilizar sus credenciales oficiales. Si el problema persiste, intente olvidar la red o consulte el estado del punto de acceso en su edificio.',
        visitas: 95,
        utilCount: 64,
      },
      {
        titulo: '¿Cómo reportar una falla o interrupción en el portal web?',
        categoria: 'Incidentes',
        contenido:
          'Genere un ticket de Incidente indicando la hora del error, captura de pantalla si la tiene, y si el problema impide completamente su trabajo (Interrupción) o solo provoca lentitud (Degradación).',
        visitas: 210,
        utilCount: 150,
      },
      {
        titulo: '¿Cuál es el proceso para solicitar un nuevo servicio de TI para una unidad?',
        categoria: 'Nuevos Servicios',
        contenido:
          'Toda solicitud de nuevo servicio debe canalizarse mediante la cola de Nuevos Servicios con un análisis preliminar de justificación, usuarios beneficiarios y viabilidad técnica.',
        visitas: 45,
        utilCount: 30,
      },
    ];

    await this.faqRepo.save(this.faqRepo.create(faqs));
  }
}
