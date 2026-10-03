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
import { Empresa } from './empresa.entity';
import { Departamento } from './departamento.entity';

@Entity('areas')
@Unique(['empresaId', 'codigo'])
export class Area {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa_id' })
  empresaId: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.areas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 50 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Departamento, (dpto) => dpto.area)
  departamentos: Departamento[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
