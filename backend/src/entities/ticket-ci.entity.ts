import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { CmdbCi } from './cmdb-ci.entity';

@Entity('ticket_cis')
export class TicketCi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({ name: 'ci_id' })
  ciId: number;

  @ManyToOne(() => CmdbCi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ci_id' })
  ci: CmdbCi;

  @Column({ length: 100, nullable: true })
  impactoEnCi: string | null; // e.g. 'Interrupción directa', 'Degradación de latencia', 'En mantenimiento'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
