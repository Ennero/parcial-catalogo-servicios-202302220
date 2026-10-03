import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { ServicioN1 } from '../../entities/servicio-n1.entity';
import { ServicioN2 } from '../../entities/servicio-n2.entity';
import { ClaseServicio } from '../../entities/clase-servicio.entity';
import { CriticidadServicio } from '../../entities/criticidad-servicio.entity';
import { TipoServicio } from '../../entities/tipo-servicio.entity';
import { Seccion } from '../../entities/seccion.entity';
import { Usuario } from '../../entities/usuario.entity';
import {
  CreateServicioN1Dto,
  UpdateServicioN1Dto,
  CreateServicioN2Dto,
  UpdateServicioN2Dto,
  FilterServiciosQueryDto,
} from './dto/catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(ServicioN1)
    private readonly s1Repo: Repository<ServicioN1>,
    @InjectRepository(ServicioN2)
    private readonly s2Repo: Repository<ServicioN2>,
    @InjectRepository(ClaseServicio)
    private readonly claseRepo: Repository<ClaseServicio>,
    @InjectRepository(CriticidadServicio)
    private readonly critRepo: Repository<CriticidadServicio>,
    @InjectRepository(TipoServicio)
    private readonly tipoRepo: Repository<TipoServicio>,
    @InjectRepository(Seccion)
    private readonly seccionRepo: Repository<Seccion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // ================= CATÁLOGOS AUXILIARES =================
  async getClases(): Promise<ClaseServicio[]> {
    return this.claseRepo.find({ order: { nombre: 'ASC' } });
  }

  async getCriticidades(): Promise<CriticidadServicio[]> {
    return this.critRepo.find({ order: { nivel: 'ASC' } });
  }

  async getTipos(): Promise<TipoServicio[]> {
    return this.tipoRepo.find({ order: { nombre: 'ASC' } });
  }

  // ================= SERVICIOS NIVEL 1 =================
  async getServiciosN1(): Promise<ServicioN1[]> {
    return this.s1Repo.find({
      relations: ['serviciosN2'],
      order: { codigo: 'ASC' },
    });
  }

  async getServicioN1ById(id: number): Promise<ServicioN1> {
    const s1 = await this.s1Repo.findOne({
      where: { id },
      relations: ['serviciosN2'],
    });
    if (!s1) throw new NotFoundException(`Servicio de Nivel 1 con ID ${id} no encontrado.`);
    return s1;
  }

  async createServicioN1(dto: CreateServicioN1Dto): Promise<ServicioN1> {
    const exists = await this.s1Repo.findOne({ where: { codigo: dto.codigo } });
    if (exists) {
      throw new ConflictException(`Ya existe un servicio Nivel 1 con el código '${dto.codigo}'.`);
    }
    const s1 = this.s1Repo.create(dto);
    return this.s1Repo.save(s1);
  }

  async updateServicioN1(id: number, dto: UpdateServicioN1Dto): Promise<ServicioN1> {
    const s1 = await this.getServicioN1ById(id);
    Object.assign(s1, dto);
    return this.s1Repo.save(s1);
  }

  // ================= SERVICIOS NIVEL 2 =================
  async getServiciosN2(query: FilterServiciosQueryDto) {
    const page = query.page ? Math.max(1, parseInt(query.page, 10)) : 1;
    const limit = query.limit ? Math.max(1, parseInt(query.limit, 10)) : 20;
    const skip = (page - 1) * limit;

    const qb = this.s2Repo
      .createQueryBuilder('s2')
      .leftJoinAndSelect('s2.servicioN1', 's1')
      .leftJoinAndSelect('s2.clase', 'clase')
      .leftJoinAndSelect('s2.criticidad', 'crit')
      .leftJoinAndSelect('s2.tipo', 'tipo')
      .leftJoinAndSelect('s2.seccionResponsable', 'sec')
      .leftJoinAndSelect('s2.usuarioResponsable', 'usr');

    // Filtro por búsqueda textual (código, nombre o descripción)
    if (query.search) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere(
        '(s2.codigo LIKE :term OR s2.nombre LIKE :term OR s2.descripcion LIKE :term OR s1.nombre LIKE :term)',
        { term },
      );
    }

    if (query.servicioN1Id) {
      qb.andWhere('s2.servicioN1Id = :s1Id', { s1Id: parseInt(query.servicioN1Id, 10) });
    }

    if (query.claseId) {
      qb.andWhere('s2.claseId = :claseId', { claseId: parseInt(query.claseId, 10) });
    }

    if (query.criticidadId) {
      qb.andWhere('s2.criticidadId = :critId', { critId: parseInt(query.criticidadId, 10) });
    }

    if (query.tipoId) {
      qb.andWhere('s2.tipoId = :tipoId', { tipoId: parseInt(query.tipoId, 10) });
    }

    if (query.activo !== undefined && query.activo !== '') {
      const isActivo = query.activo === 'true' || query.activo === '1';
      qb.andWhere('s2.activo = :activo', { activo: isActivo });
    }

    qb.orderBy('s2.codigo', 'ASC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((item) => this.sanitizeService(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getServicioN2ById(id: number): Promise<any> {
    const s2 = await this.s2Repo.findOne({
      where: { id },
      relations: [
        'servicioN1',
        'clase',
        'criticidad',
        'tipo',
        'seccionResponsable',
        'seccionResponsable.departamento',
        'seccionResponsable.departamento.area',
        'usuarioResponsable',
        'usuarioResponsable.puesto',
      ],
    });

    if (!s2) throw new NotFoundException(`Servicio de Nivel 2 con ID ${id} no encontrado.`);
    return this.sanitizeService(s2);
  }

  async createServicioN2(dto: CreateServicioN2Dto): Promise<any> {
    // 1. Validar unicidad de código N2
    const exists = await this.s2Repo.findOne({ where: { codigo: dto.codigo } });
    if (exists) {
      throw new ConflictException(`Ya existe un servicio Nivel 2 con el código '${dto.codigo}'.`);
    }

    // 2. Validar existencia del Nivel 1 padre
    const s1 = await this.s1Repo.findOne({ where: { id: dto.servicioN1Id } });
    if (!s1) {
      throw new NotFoundException(`Servicio Nivel 1 con ID ${dto.servicioN1Id} no encontrado.`);
    }

    // 3. Validar regla de negocio de Mínimo y Máximo (P09)
    this.validateMinMax(dto.minimo, dto.maximo);

    // 4. Validar regla de responsabilidad RACI / ITIL (P11)
    await this.validateRaciAssignment(dto.seccionResponsableId, dto.usuarioResponsableId);

    const s2 = this.s2Repo.create({
      ...dto,
      minimo: dto.minimo !== undefined ? dto.minimo : null,
      maximo: dto.maximo !== undefined ? dto.maximo : null,
    });

    const saved = await this.s2Repo.save(s2);
    return this.getServicioN2ById(saved.id);
  }

  async updateServicioN2(id: number, dto: UpdateServicioN2Dto): Promise<any> {
    const s2 = await this.s2Repo.findOne({ where: { id } });
    if (!s2) throw new NotFoundException(`Servicio de Nivel 2 con ID ${id} no encontrado.`);

    // Calcular valores efectivos de min y max para validación
    const effectiveMin = dto.minimo !== undefined ? dto.minimo : s2.minimo;
    const effectiveMax = dto.maximo !== undefined ? dto.maximo : s2.maximo;
    this.validateMinMax(effectiveMin, effectiveMax);

    // Calcular valores efectivos de sección y usuario responsable
    const effectiveSec =
      dto.seccionResponsableId !== undefined ? dto.seccionResponsableId : s2.seccionResponsableId;
    const effectiveUser =
      dto.usuarioResponsableId !== undefined ? dto.usuarioResponsableId : s2.usuarioResponsableId;

    await this.validateRaciAssignment(effectiveSec, effectiveUser);

    Object.assign(s2, dto);
    const saved = await this.s2Repo.save(s2);
    return this.getServicioN2ById(saved.id);
  }

  private validateMinMax(min: number | null | undefined, max: number | null | undefined) {
    if (min !== null && min !== undefined && max !== null && max !== undefined) {
      const numMin = Number(min);
      const numMax = Number(max);
      if (numMin > numMax) {
        throw new BadRequestException(
          `Validación fallida: El umbral mínimo (${numMin}) no puede ser mayor que el umbral máximo (${numMax}).`,
        );
      }
    }
  }

  private async validateRaciAssignment(
    seccionId: number | null | undefined,
    usuarioId: number | null | undefined,
  ) {
    if (usuarioId) {
      if (!seccionId) {
        throw new BadRequestException(
          'Debe designar una sección responsable antes de asignar a un usuario responsable (Service Owner).',
        );
      }

      const usuario = await this.usuarioRepo.findOne({
        where: { id: usuarioId },
        relations: ['puesto'],
      });

      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${usuarioId} no existe.`);
      }

      if (!usuario.puesto) {
        throw new BadRequestException(
          `El usuario '${usuario.nombre}' no tiene un puesto asignado y no puede ser designado responsable.`,
        );
      }

      // Regla P11: El usuario debe pertenecer estrictamente a la sección del servicio
      if (usuario.puesto.seccionId !== seccionId) {
        const seccion = await this.seccionRepo.findOne({ where: { id: seccionId } });
        throw new BadRequestException(
          `Violación de gobernanza RACI: El usuario responsable '${usuario.nombre}' pertenece a otra sección y no a la sección '${seccion?.nombre || seccionId}'.`,
        );
      }
    }
  }

  private sanitizeService(s2: ServicioN2): any {
    if (s2.usuarioResponsable) {
      const { passwordHash, ...safeUser } = s2.usuarioResponsable;
      s2.usuarioResponsable = safeUser as any;
    }
    return s2;
  }
}
