import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ServicioN2 } from './servicio-n2.entity';

@Entity('clases_servicio')
export class ClaseServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ServicioN2, (srv) => srv.clase)
  servicios: ServicioN2[];
}
