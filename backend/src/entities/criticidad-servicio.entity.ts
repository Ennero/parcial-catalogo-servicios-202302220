import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ServicioN2 } from './servicio-n2.entity';

@Entity('criticidades_servicio')
export class CriticidadServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  nombre: string;

  @Column({ default: 1 })
  nivel: number;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ServicioN2, (srv) => srv.criticidad)
  servicios: ServicioN2[];
}
