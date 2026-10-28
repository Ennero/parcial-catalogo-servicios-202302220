import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity('ticket_bitacora')
export class TicketBitacora {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'actor_id', nullable: true })
  actorId: number | null;

  @Column({ length: 150, name: 'actor_nombre' })
  actorNombre: string;

  @Column({ length: 100 })
  accion: string; // 'CREACION', 'ASIGNACION', 'CAMBIO_ESTADO', 'TRANSFERENCIA', 'COMENTARIO', 'ADJUNTO', 'RESOLUCION', 'REAPERTURA', 'CIERRE'

  @Column({ length: 100, nullable: true, name: 'campo_modificado' })
  campoModificado: string | null;

  @Column({ type: 'text', nullable: true, name: 'valor_anterior' })
  valorAnterior: string | null;

  @Column({ type: 'text', nullable: true, name: 'valor_nuevo' })
  valorNuevo: string | null;

  @Column({ type: 'text', nullable: true })
  motivo: string | null;

  @CreateDateColumn()
  fecha: Date;
}
