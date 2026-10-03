import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Area } from './area.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Area, (area) => area.empresa)
  areas: Area[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
