import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { Usuario } from './usuario.entity';

@Entity('ticket_adjuntos')
export class TicketAdjunto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ length: 255, name: 'nombre_original' })
  nombreOriginal: string;

  @Column({ length: 255, name: 'nombre_almacenado' })
  nombreAlmacenado: string;

  @Column({ length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int', name: 'tamano_bytes' })
  tamanoBytes: number;

  @Column({ name: 'subido_por_id' })
  subidoPorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subido_por_id' })
  subidoPor: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
