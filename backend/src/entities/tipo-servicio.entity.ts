import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ServicioN2 } from './servicio-n2.entity';

@Entity('tipos_servicio')
export class TipoServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ServicioN2, (srv) => srv.tipo)
  servicios: ServicioN2[];
}
