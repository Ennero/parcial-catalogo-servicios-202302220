import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CmdbCi } from './cmdb-ci.entity';
import { ServicioN2 } from './servicio-n2.entity';

@Entity('cmdb_ci_servicios')
export class CmdbCiServicio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ci_id' })
  ciId: number;

  @ManyToOne(() => CmdbCi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ci_id' })
  ci: CmdbCi;

  @Column({ name: 'servicio_n2_id' })
  servicioN2Id: number;

  @ManyToOne(() => ServicioN2, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'servicio_n2_id' })
  servicioN2: ServicioN2;

  @Column({ length: 100, nullable: true })
  rolEnServicio: string | null; // e.g. 'Servidor Principal', 'Base de Datos Producción', 'Firewall Perimetral'

  @CreateDateColumn()
  createdAt: Date;
}
