import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ColaAtencion } from './cola-atencion.entity';

@Entity('cola_roles')
export class ColaRol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cola_id' })
  colaId: number;

  @ManyToOne(() => ColaAtencion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cola_id' })
  cola: ColaAtencion;

  @Column({ length: 50 })
  rol: string; // 'administrador', 'consulta', 'agente', 'aprobador'

  @Column({ default: true, name: 'puede_consultar' })
  puedeConsultar: boolean;

  @Column({ default: false, name: 'puede_atender' })
  puedeAtender: boolean;

  @Column({ default: false, name: 'puede_transferir' })
  puedeTransferir: boolean;

  @Column({ default: false, name: 'puede_aprobar' })
  puedeAprobar: boolean;

  @Column({ default: false, name: 'puede_administrar' })
  puedeAdministrar: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
