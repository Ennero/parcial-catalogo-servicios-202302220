import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cmdb_categorias')
export class CmdbCategoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  codigo: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ type: 'int', default: 1 })
  nivel: number; // 1: Macro-categoría/Dominio, 2: Familia/Subcategoría, 3: Clase/Tipo

  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  @ManyToOne(() => CmdbCategoria, (cat) => cat.children, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: CmdbCategoria | null;

  @OneToMany(() => CmdbCategoria, (cat) => cat.parent)
  children: CmdbCategoria[];

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
