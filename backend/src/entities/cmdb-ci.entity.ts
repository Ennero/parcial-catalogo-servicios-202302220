import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CmdbCategoria } from './cmdb-categoria.entity';
import { Usuario } from './usuario.entity';

@Entity('cmdb_cis')
export class CmdbCi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  codigo: string; // Etiqueta o identificador único (e.g. CI-SRV-0001)

  @Column({ length: 200 })
  nombre: string;

  @Column({ name: 'categoria_id' })
  categoriaId: number;

  @ManyToOne(() => CmdbCategoria, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoria_id' })
  categoria: CmdbCategoria;

  @Column({ length: 50, default: 'operativo' })
  estado: string; // 'operativo', 'mantenimiento', 'retirado', 'falla', 'en_almacen'

  @Column({ length: 200 })
  ubicacion: string;

  @Column({ name: 'responsable_id' })
  responsableId: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'responsable_id' })
  responsable: Usuario;

  @Column({ default: false, name: 'tiene_ip' })
  tieneIp: boolean;

  @Column({ length: 50, nullable: true })
  ip: string | null;

  @Column({ length: 50, nullable: true })
  mac: string | null;

  @Column({ length: 100, nullable: true, name: 'numero_serie' })
  numeroSerie: string | null;

  @Column({ length: 150, nullable: true })
  modelo: string | null;

  @Column({ length: 150, nullable: true })
  fabricante: string | null;

  @Column({ type: 'text', nullable: true, name: 'atributos_tecnicos' })
  atributosTecnicos: string | null; // JSON serializado con especificaciones particulares

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
