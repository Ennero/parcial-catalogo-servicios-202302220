import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServicioN1 } from './servicio-n1.entity';
import { ClaseServicio } from './clase-servicio.entity';
import { CriticidadServicio } from './criticidad-servicio.entity';
import { TipoServicio } from './tipo-servicio.entity';
import { Seccion } from './seccion.entity';
import { Usuario } from './usuario.entity';

@Entity('servicios_n2')
export class ServicioN2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  codigo: string;

  @Column({ length: 255 })
  nombre: string;

  @Column({ name: 'estado_activo', length: 20, default: 'S' })
  estadoActivo: string; // 'S', 'N', 'DESCONOCIDO'

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ length: 150, nullable: true })
  metrica: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minimo: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maximo: number | null;

  @Column({ name: 'servicio_n1_id' })
  servicioN1Id: number;

  @ManyToOne(() => ServicioN1, (s1) => s1.serviciosN2, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'servicio_n1_id' })
  servicioN1: ServicioN1;

  @Column({ name: 'clase_id', nullable: true })
  claseId: number | null;

  @ManyToOne(() => ClaseServicio, (clase) => clase.servicios, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'clase_id' })
  clase: ClaseServicio | null;

  @Column({ name: 'criticidad_id', nullable: true })
  criticidadId: number | null;

  @ManyToOne(() => CriticidadServicio, (crit) => crit.servicios, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'criticidad_id' })
  criticidad: CriticidadServicio | null;

  @Column({ name: 'tipo_id', nullable: true })
  tipoId: number | null;

  @ManyToOne(() => TipoServicio, (tipo) => tipo.servicios, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tipo_id' })
  tipo: TipoServicio | null;

  @Column({ name: 'seccion_responsable_id', nullable: true })
  seccionResponsableId: number | null;

  @ManyToOne(() => Seccion, (seccion) => seccion.serviciosAsignados, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'seccion_responsable_id' })
  seccionResponsable: Seccion | null;

  @Column({ name: 'usuario_responsable_id', nullable: true })
  usuarioResponsableId: number | null;

  @ManyToOne(() => Usuario, (usuario) => usuario.serviciosBajoResponsabilidad, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'usuario_responsable_id' })
  usuarioResponsable: Usuario | null;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
