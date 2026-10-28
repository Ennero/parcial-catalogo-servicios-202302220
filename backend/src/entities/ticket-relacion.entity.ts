import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';

export type TipoRelacionTicket =
  | 'causa'
  | 'relacionado_con'
  | 'duplicado_de'
  | 'resuelve'
  | 'genera_incidente';

@Entity('ticket_relaciones')
export class TicketRelacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_origen_id' })
  ticketOrigenId: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_origen_id' })
  ticketOrigen: Ticket;

  @Column({ name: 'ticket_destino_id' })
  ticketDestinoId: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_destino_id' })
  ticketDestino: Ticket;

  @Column({ length: 50, name: 'tipo_relacion' })
  tipoRelacion: TipoRelacionTicket;

  @Column({ length: 255, nullable: true })
  descripcion: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
