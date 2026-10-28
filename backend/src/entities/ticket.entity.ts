import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { ServicioN1 } from './servicio-n1.entity';
import { ServicioN2 } from './servicio-n2.entity';
import { ColaAtencion, ProcesoServiceDesk } from './cola-atencion.entity';

export type TipoTicket =
  | 'solicitud_acceso'
  | 'evento'
  | 'incidente'
  | 'solicitud_cambio'
  | 'requisicion_servicio'
  | 'problema';

export type EstadoTicket =
  | 'nuevo'
  | 'asignado'
  | 'en_progreso'
  | 'en_espera'
  | 'aprobado'
  | 'rechazado'
  | 'resuelto'
  | 'cerrado'
  | 'cancelado';

export type PrioridadTicket = 'muy_alta' | 'alta' | 'media' | 'baja' | 'muy_baja';
export type ImpactoTicket = 'alto' | 'medio' | 'bajo';
export type UrgenciaTicket = 'alta' | 'media' | 'baja';
export type CanalTicket = 'portal' | 'correo' | 'telefono' | 'monitoreo' | 'chat';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  numero: string; // e.g. 'TK-2026-00001'

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'solicitante_id' })
  solicitanteId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'solicitante_id' })
  solicitante: Usuario;

  @Column({ name: 'creador_id' })
  creadorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creador_id' })
  creador: Usuario;

  @Column({ name: 'servicio_n2_id' })
  servicioN2Id: number;

  @ManyToOne(() => ServicioN2, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'servicio_n2_id' })
  servicioN2: ServicioN2;

  @Column({ name: 'servicio_n1_id' })
  servicioN1Id: number; // Nivel 1 derivado obligatoriamente del Nivel 2

  @ManyToOne(() => ServicioN1, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'servicio_n1_id' })
  servicioN1: ServicioN1;

  @Column({ length: 50 })
  tipo: TipoTicket;

  @Column({ length: 50 })
  proceso: ProcesoServiceDesk;

  @Column({ name: 'cola_id' })
  colaId: number;

  @ManyToOne(() => ColaAtencion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cola_id' })
  cola: ColaAtencion;

  @Column({ name: 'responsable_id', nullable: true })
  responsableId: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Usuario | null;

  @Column({ length: 50, default: 'nuevo' })
  estado: EstadoTicket;

  @Column({ length: 20, default: 'media' })
  prioridad: PrioridadTicket;

  @Column({ length: 20, default: 'medio' })
  impacto: ImpactoTicket;

  @Column({ length: 20, default: 'media' })
  urgencia: UrgenciaTicket;

  @Column({ length: 50, default: 'portal' })
  canal: CanalTicket;

  @Column({ type: 'text', nullable: true, name: 'sin_ci_justificacion' })
  sinCiJustificacion: string | null;

  @Column({ type: 'text', nullable: true, name: 'metadata_proceso' })
  metadataProceso: string | null; // JSON con datos específicos (E0-E3, I0-I6, planes de cambio, etc.)

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_asignacion' })
  fechaAsignacion: Date | null;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_primera_respuesta' })
  fechaPrimeraRespuesta: Date | null;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_resolucion' })
  fechaResolucion: Date | null;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_cierre' })
  fechaCierre: Date | null;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_reapertura' })
  fechaReapertura: Date | null;

  @Column({ type: 'text', nullable: true, name: 'solucion_aplicada' })
  solucionAplicada: string | null;

  @Column({ type: 'text', nullable: true, name: 'motivo_reapertura' })
  motivoReapertura: string | null;

  @Column({ type: 'text', nullable: true, name: 'motivo_cancelacion' })
  motivoCancelacion: string | null;
}
