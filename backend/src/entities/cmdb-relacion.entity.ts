import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CmdbCi } from './cmdb-ci.entity';

export type TipoRelacionCi = 'depende_de' | 'conectado_a' | 'alojado_en';

@Entity('cmdb_relaciones')
export class CmdbRelacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'origen_id' })
  origenId: number;

  @ManyToOne(() => CmdbCi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'origen_id' })
  origen: CmdbCi;

  @Column({ name: 'destino_id' })
  destinoId: number;

  @ManyToOne(() => CmdbCi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'destino_id' })
  destino: CmdbCi;

  @Column({ length: 50 })
  tipoRelacion: TipoRelacionCi; // 'depende_de' (DAG acíclico), 'conectado_a' (bidireccional), 'alojado_en' (contenedor)

  @Column({ length: 255, nullable: true })
  descripcion: string | null;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
