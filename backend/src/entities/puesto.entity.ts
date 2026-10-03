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
import { Seccion } from './seccion.entity';
import { Usuario } from './usuario.entity';

@Entity('puestos')
@Unique(['seccionId', 'codigo'])
export class Puesto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'seccion_id' })
  seccionId: number;

  @ManyToOne(() => Seccion, (seccion) => seccion.puestos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seccion_id' })
  seccion: Seccion;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Usuario, (usuario) => usuario.puesto)
  usuarios: Usuario[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
