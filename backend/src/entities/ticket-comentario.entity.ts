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

@Entity('ticket_comentarios')
export class TicketComentario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'autor_id' })
  autorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'autor_id' })
  autor: Usuario;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ default: false, name: 'es_nota_interna' })
  esNotaInterna: boolean; // Distingue notas internas de comentarios visibles al solicitante

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
