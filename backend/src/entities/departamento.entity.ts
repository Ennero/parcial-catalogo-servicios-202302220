import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Area } from './area.entity';
import { Seccion } from './seccion.entity';

@Entity('departamentos')
@Unique(['areaId', 'codigo'])
export class Departamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'area_id' })
  areaId: number;

  @ManyToOne(() => Area, (area) => area.departamentos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Seccion, (seccion) => seccion.departamento)
  secciones: Seccion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
