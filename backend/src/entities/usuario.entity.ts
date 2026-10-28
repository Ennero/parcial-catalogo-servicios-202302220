import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Puesto } from './puesto.entity';
import { ServicioN2 } from './servicio-n2.entity';

export enum UserRole {
  ADMINISTRADOR = 'administrador',
  CONSULTA = 'consulta',
  AGENTE = 'agente',
  APROBADOR = 'aprobador',
  SOLICITANTE = 'solicitante',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSULTA,
  })
  rol: UserRole;

  @Column({ type: 'text', nullable: true, name: 'roles_secundarios' })
  rolesSecundarios: string | null; // Lista de roles adicionales separados por coma, e.g. "agente,aprobador"

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'puesto_id', nullable: true })
  puestoId: number | null;

  @ManyToOne(() => Puesto, (puesto) => puesto.usuarios, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'puesto_id' })
  puesto: Puesto | null;

  @OneToMany(() => ServicioN2, (srv) => srv.usuarioResponsable)
  serviciosBajoResponsabilidad: ServicioN2[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
