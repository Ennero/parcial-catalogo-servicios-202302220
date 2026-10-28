import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ColaAtencion } from './cola-atencion.entity';
import { Usuario } from './usuario.entity';

@Entity('cola_usuarios')
export class ColaUsuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cola_id' })
  colaId: number;

  @ManyToOne(() => ColaAtencion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cola_id' })
  cola: ColaAtencion;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ default: true, name: 'puede_consultar' })
  puedeConsultar: boolean;

  @Column({ default: true, name: 'puede_atender' })
  puedeAtender: boolean;

  @Column({ default: true, name: 'puede_transferir' })
  puedeTransferir: boolean;

  @Column({ default: false, name: 'puede_aprobar' })
  puedeAprobar: boolean;

  @Column({ default: false, name: 'puede_administrar' })
  puedeAdministrar: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
