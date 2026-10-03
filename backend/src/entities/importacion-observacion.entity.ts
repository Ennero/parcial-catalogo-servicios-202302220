import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ImportacionLog } from './importacion-log.entity';

@Entity('importaciones_observaciones')
export class ImportacionObservacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'importacion_log_id' })
  importacionLogId: number;

  @ManyToOne(() => ImportacionLog, (log) => log.observaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'importacion_log_id' })
  importacionLog: ImportacionLog;

  @Column({ nullable: true })
  fila: number | null;

  @Column({ length: 50, nullable: true })
  codigo: string | null;

  @Column({ length: 100 })
  tipo: string; // 'CONFLICTO_SE12', 'ATRIBUTOS_INCOMPLETOS', 'CELDA_COMBINADA', 'ALERTA', 'ACTUALIZACION'

  @Column({ type: 'text' })
  mensaje: string;
}
