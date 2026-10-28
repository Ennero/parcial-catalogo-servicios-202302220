import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ProcesoServiceDesk =
  | 'nuevos_servicios'
  | 'cambios'
  | 'incidentes'
  | 'eventos'
  | 'problemas'
  | 'accesos'
  | 'servicios_ti';

export type ReglaOrdenamiento = 'prioridad_antiguedad' | 'antiguedad' | 'sla';

@Entity('colas_atencion')
export class ColaAtencion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  codigo: string; // e.g. 'COLA-INC-N1', 'COLA-CAMBIOS'

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ length: 50 })
  proceso: ProcesoServiceDesk; // Exactamente uno de los 7 procesos

  @Column({ type: 'int', default: 1 })
  nivelSoporte: number; // 0: Autoservicio, 1: Help Desk, 2: Soporte Técnico, 3: Ingenieros, 4: Externo

  @Column({ type: 'int', default: 60, name: 'sla_minutos_primera_atencion' })
  slaMinutosPrimeraAtencion: number;

  @Column({ type: 'int', default: 480, name: 'sla_minutos_resolucion' })
  slaMinutosResolucion: number;

  @Column({ length: 20, default: 'habil', name: 'tipo_tiempo' })
  tipoTiempo: string; // 'calendario' | 'habil'

  @Column({ length: 50, default: 'prioridad_antiguedad', name: 'regla_ordenamiento' })
  reglaOrdenamiento: ReglaOrdenamiento;

  @Column({ length: 50, default: 'manual', name: 'politica_asignacion' })
  politicaAsignacion: string; // 'manual' | 'automatica' | 'mixta'

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
