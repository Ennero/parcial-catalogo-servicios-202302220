import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ServicioN2 } from './servicio-n2.entity';

@Entity('servicios_n1')
export class ServicioN1 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ServicioN2, (s2) => s2.servicioN1)
  serviciosN2: ServicioN2[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
