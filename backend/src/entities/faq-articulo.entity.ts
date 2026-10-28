import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServicioN2 } from './servicio-n2.entity';

@Entity('faq_articulos')
export class FaqArticulo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  titulo: string;

  @Column({ length: 100, default: 'General' })
  categoria: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ name: 'servicio_n2_id', nullable: true })
  servicioN2Id: number | null;

  @ManyToOne(() => ServicioN2, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'servicio_n2_id' })
  servicioN2: ServicioN2 | null;

  @Column({ type: 'int', default: 0 })
  visitas: number;

  @Column({ type: 'int', default: 0, name: 'util_count' })
  utilCount: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
