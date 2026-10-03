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
import { Departamento } from './departamento.entity';
import { Puesto } from './puesto.entity';
import { ServicioN2 } from './servicio-n2.entity';

@Entity('secciones')
@Unique(['departamentoId', 'codigo'])
export class Seccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'departamento_id' })
  departamentoId: number;

  @ManyToOne(() => Departamento, (dpto) => dpto.secciones, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'departamento_id' })
  departamento: Departamento;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Puesto, (puesto) => puesto.seccion)
  puestos: Puesto[];

  @OneToMany(() => ServicioN2, (srv) => srv.seccionResponsable)
  serviciosAsignados: ServicioN2[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
