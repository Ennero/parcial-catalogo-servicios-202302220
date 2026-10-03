import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ImportacionObservacion } from './importacion-observacion.entity';

@Entity('importaciones_log')
export class ImportacionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fecha: Date;

  @Column({ length: 255 })
  archivo: string;

  @Column({ name: 'creados_n1', default: 0 })
  creadosN1: number;

  @Column({ name: 'creados_n2', default: 0 })
  creadosN2: number;

  @Column({ default: 0 })
  actualizados: number;

  @Column({ default: 0 })
  omitidos: number;

  @Column({ name: 'total_n1', default: 0 })
  totalN1: number;

  @Column({ name: 'total_n2', default: 0 })
  totalN2: number;

  @OneToMany(() => ImportacionObservacion, (obs) => obs.importacionLog, {
    cascade: true,
  })
  observaciones: ImportacionObservacion[];
}
