import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import {
  CmdbCategoria,
  CmdbCi,
  CmdbRelacion,
  CmdbCiServicio,
  Usuario,
  ServicioN2,
  ServicioN1,
} from '../../entities';
import {
  CreateCmdbCategoriaDto,
  CreateCmdbCiDto,
  CreateCmdbRelacionDto,
  VincularCiServicioDto,
  GenerarCisDto,
} from './dto/cmdb.dto';

// PRNG determinista Mulberry32
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

@Injectable()
export class CmdbService {
  constructor(
    @InjectRepository(CmdbCategoria)
    private readonly catRepo: Repository<CmdbCategoria>,
    @InjectRepository(CmdbCi)
    private readonly ciRepo: Repository<CmdbCi>,
    @InjectRepository(CmdbRelacion)
    private readonly relacionRepo: Repository<CmdbRelacion>,
    @InjectRepository(CmdbCiServicio)
    private readonly ciServicioRepo: Repository<CmdbCiServicio>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(ServicioN2)
    private readonly s2Repo: Repository<ServicioN2>,
    @InjectRepository(ServicioN1)
    private readonly s1Repo: Repository<ServicioN1>,
  ) {}

  // ---------------------------------------------------------------------------
  // 1. Taxonomía y Jerarquía de Categorías (ITIL v4)
  // ---------------------------------------------------------------------------
  async seedCategories(): Promise<{ total: number; message: string }> {
    const existing = await this.catRepo.count();
    if (existing > 0) {
      return { total: existing, message: 'Categorías ya inicializadas' };
    }

    // Nivel 1: Macro-Categorías
    const macroCats = [
      { codigo: 'CAT-HW', nombre: 'Hardware e Infraestructura Física', nivel: 1 },
      { codigo: 'CAT-SW', nombre: 'Software y Aplicaciones', nivel: 1 },
      { codigo: 'CAT-NET', nombre: 'Redes y Telecomunicaciones', nivel: 1 },
      { codigo: 'CAT-CLOUD', nombre: 'Nube y Virtualización', nivel: 1 },
      { codigo: 'CAT-SEC', nombre: 'Seguridad y Perímetro', nivel: 1 },
      { codigo: 'CAT-SRV', nombre: 'Servicios de TI y Negocio', nivel: 1 },
    ];

    const savedMacros = new Map<string, CmdbCategoria>();
    for (const m of macroCats) {
      const cat = await this.catRepo.save(this.catRepo.create(m));
      savedMacros.set(m.codigo, cat);
    }

    // Nivel 2: Familias
    const familias = [
      { codigo: 'CAT-HW-SRV', nombre: 'Servidores y Cómputo Físico', nivel: 2, parent: 'CAT-HW' },
      { codigo: 'CAT-HW-STR', nombre: 'Almacenamiento (SAN/NAS)', nivel: 2, parent: 'CAT-HW' },
      { codigo: 'CAT-HW-WRK', nombre: 'Puestos de Trabajo y Terminales', nivel: 2, parent: 'CAT-HW' },
      { codigo: 'CAT-HW-DAT', nombre: 'Infraestructura de Datacenter', nivel: 2, parent: 'CAT-HW' },

      { codigo: 'CAT-SW-SYS', nombre: 'Sistemas Operativos Base', nivel: 2, parent: 'CAT-SW' },
      { codigo: 'CAT-SW-DB', nombre: 'Bases de Datos y Repositorios', nivel: 2, parent: 'CAT-SW' },
      { codigo: 'CAT-SW-MID', nombre: 'Middleware y Web Servers', nivel: 2, parent: 'CAT-SW' },
      { codigo: 'CAT-SW-APP', nombre: 'Aplicaciones Empresariales', nivel: 2, parent: 'CAT-SW' },

      { codigo: 'CAT-NET-SW', nombre: 'Conmutadores (Switches)', nivel: 2, parent: 'CAT-NET' },
      { codigo: 'CAT-NET-RTR', nombre: 'Enrutadores (Routers)', nivel: 2, parent: 'CAT-NET' },
      { codigo: 'CAT-NET-WIFI', nombre: 'Red Inalámbrica y APs', nivel: 2, parent: 'CAT-NET' },

      { codigo: 'CAT-CLOUD-VM', nombre: 'Instancias y Máquinas Virtuales', nivel: 2, parent: 'CAT-CLOUD' },
      { codigo: 'CAT-CLOUD-K8S', nombre: 'Contenedores y Clústeres Kubernetes', nivel: 2, parent: 'CAT-CLOUD' },
      { codigo: 'CAT-CLOUD-STO', nombre: 'Almacenamiento en la Nube (S3/Blobs)', nivel: 2, parent: 'CAT-CLOUD' },

      { codigo: 'CAT-SEC-FW', nombre: 'Firewalls e Inspección UTM', nivel: 2, parent: 'CAT-SEC' },
      { codigo: 'CAT-SEC-VPN', nombre: 'Gateways y Concentradores VPN', nivel: 2, parent: 'CAT-SEC' },
      { codigo: 'CAT-SEC-CERT', nombre: 'Criptografía y Llaves Digitales', nivel: 2, parent: 'CAT-SEC' },

      { codigo: 'CAT-SRV-BUS', nombre: 'Servicios de Negocio Críticos', nivel: 2, parent: 'CAT-SRV' },
      { codigo: 'CAT-SRV-INF', nombre: 'Servicios de Infraestructura de Soporte', nivel: 2, parent: 'CAT-SRV' },
    ];

    const savedFamilias = new Map<string, CmdbCategoria>();
    for (const f of familias) {
      const parent = savedMacros.get(f.parent);
      const cat = await this.catRepo.save(
        this.catRepo.create({
          codigo: f.codigo,
          nombre: f.nombre,
          nivel: f.nivel,
          parentId: parent?.id ?? null,
        }),
      );
      savedFamilias.set(f.codigo, cat);
    }

    // Nivel 3: Clases Específicas de CIs
    const clases = [
      { codigo: 'CI-CLASS-SRV-RACK', nombre: 'Servidor Rack Enterprise', nivel: 3, parent: 'CAT-HW-SRV' },
      { codigo: 'CI-CLASS-SRV-BLADE', nombre: 'Chasis Blade Server', nivel: 3, parent: 'CAT-HW-SRV' },
      { codigo: 'CI-CLASS-SAN-ARRAY', nombre: 'Arreglo de Discos SAN', nivel: 3, parent: 'CAT-HW-STR' },
      { codigo: 'CI-CLASS-NAS-APPL', nombre: 'Dispositivo NAS de Archivos', nivel: 3, parent: 'CAT-HW-STR' },
      { codigo: 'CI-CLASS-LAPTOP', nombre: 'Computadora Portátil / Laptop', nivel: 3, parent: 'CAT-HW-WRK' },
      { codigo: 'CI-CLASS-DESKTOP', nombre: 'Estación de Trabajo Fija', nivel: 3, parent: 'CAT-HW-WRK' },
      { codigo: 'CI-CLASS-UPS-DC', nombre: 'Sistema UPS / Banco de Baterías', nivel: 3, parent: 'CAT-HW-DAT' },
      { codigo: 'CI-CLASS-RACK-42U', nombre: 'Gabinete Rack 42U Pasivo', nivel: 3, parent: 'CAT-HW-DAT' },

      { codigo: 'CI-CLASS-DB-RDBMS', nombre: 'Motor RDBMS (MariaDB / PostgreSQL / Oracle)', nivel: 3, parent: 'CAT-SW-DB' },
      { codigo: 'CI-CLASS-DB-NOSQL', nombre: 'Motor NoSQL (MongoDB / Redis / Cassandra)', nivel: 3, parent: 'CAT-SW-DB' },
      { codigo: 'CI-CLASS-MID-WEB', nombre: 'Servidor Web Nginx / Apache', nivel: 3, parent: 'CAT-SW-MID' },
      { codigo: 'CI-CLASS-APP-CORE', nombre: 'Módulo de Aplicación Académica / Administrativa', nivel: 3, parent: 'CAT-SW-APP' },

      { codigo: 'CI-CLASS-SW-L2', nombre: 'Switch de Acceso Capa 2', nivel: 3, parent: 'CAT-NET-SW' },
      { codigo: 'CI-CLASS-SW-L3', nombre: 'Switch de Distribución / Core Capa 3', nivel: 3, parent: 'CAT-NET-SW' },
      { codigo: 'CI-CLASS-RTR-WAN', nombre: 'Enrutador BGP / Frontera WAN', nivel: 3, parent: 'CAT-NET-RTR' },
      { codigo: 'CI-CLASS-WIFI-AP', nombre: 'Punto de Acceso Wi-Fi 6', nivel: 3, parent: 'CAT-NET-WIFI' },

      { codigo: 'CI-CLASS-VM-LINUX', nombre: 'Máquina Virtual Linux (Debian / RHEL / Ubuntu)', nivel: 3, parent: 'CAT-CLOUD-VM' },
      { codigo: 'CI-CLASS-VM-WIN', nombre: 'Máquina Virtual Windows Server', nivel: 3, parent: 'CAT-CLOUD-VM' },
      { codigo: 'CI-CLASS-K8S-NODE', nombre: 'Nodo de Cómputo Kubernetes', nivel: 3, parent: 'CAT-CLOUD-K8S' },
      { codigo: 'CI-CLASS-S3-BUCKET', nombre: 'Bucket de Almacenamiento de Objetos', nivel: 3, parent: 'CAT-CLOUD-STO' },

      { codigo: 'CI-CLASS-FW-NG', nombre: 'Firewall Perimetral Next-Gen', nivel: 3, parent: 'CAT-SEC-FW' },
      { codigo: 'CI-CLASS-VPN-CONC', nombre: 'Concentrador VPN SSL / IPsec', nivel: 3, parent: 'CAT-SEC-VPN' },
      { codigo: 'CI-CLASS-SSL-CERT', nombre: 'Certificado Digital Wildcard TLS/SSL', nivel: 3, parent: 'CAT-SEC-CERT' },
    ];

    for (const c of clases) {
      const parent = savedFamilias.get(c.parent);
      await this.catRepo.save(
        this.catRepo.create({
          codigo: c.codigo,
          nombre: c.nombre,
          nivel: c.nivel,
          parentId: parent?.id ?? null,
        }),
      );
    }

    const total = await this.catRepo.count();
    return { total, message: 'Taxonomía ITIL v4 creada exitosamente' };
  }

  async getCategorias(): Promise<CmdbCategoria[]> {
    return this.catRepo.find({
      order: { nivel: 'ASC', codigo: 'ASC' },
      relations: ['parent'],
    });
  }

  async createCategoria(dto: CreateCmdbCategoriaDto): Promise<CmdbCategoria> {
    const existing = await this.catRepo.findOne({ where: { codigo: dto.codigo } });
    if (existing) {
      throw new ConflictException(`Ya existe una categoría con el código ${dto.codigo}`);
    }

    if (dto.parentId) {
      const parent = await this.catRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(`La categoría padre ID ${dto.parentId} no existe`);
      }
    }

    const cat = this.catRepo.create(dto);
    return this.catRepo.save(cat);
  }

  // Prevención de ciclos en actualización de jerarquía de categorías
  async updateCategoriaParent(id: number, newParentId: number | null): Promise<CmdbCategoria> {
    const cat = await this.catRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Categoría ID ${id} no encontrada`);

    if (newParentId === id) {
      throw new BadRequestException('Una categoría no puede ser su propio padre (auto-ciclo)');
    }

    if (newParentId !== null) {
      const parent = await this.catRepo.findOne({ where: { id: newParentId } });
      if (!parent) throw new NotFoundException(`Categoría padre ID ${newParentId} no existe`);

      // Detección de ciclo con DFS recursivo
      let currentId: number | null = newParentId;
      while (currentId !== null) {
        if (currentId === id) {
          throw new BadRequestException(
            `Detección de ciclo prohibido en jerarquía: la categoría ${id} es ancestro de ${newParentId}`,
          );
        }
        const curr = await this.catRepo.findOne({ where: { id: currentId } });
        currentId = curr?.parentId ?? null;
      }
    }

    cat.parentId = newParentId;
    return this.catRepo.save(cat);
  }

  // ---------------------------------------------------------------------------
  // 2. Generador Sintético Reproducible (>= 5,000 Dispositivos)
  // ---------------------------------------------------------------------------
  async generateSyntheticDevices(dto: GenerarCisDto): Promise<{
    semilla: number;
    totalDispositivos: number;
    insertados: number;
    existentes: number;
    resumenPorNivel: Record<string, number>;
    resumenPorCategoria: Record<string, number>;
    duracionMs: number;
  }> {
    const inicio = Date.now();
    const cantidadObjetivo = dto.cantidad && dto.cantidad >= 5000 ? dto.cantidad : 5000;
    const semilla = dto.semilla ?? 202302220;
    const rng = mulberry32(semilla);

    // Asegurar taxonomía base
    await this.seedCategories();

    // Obtener categorías de Nivel 3 (hojas)
    const categorias = await this.catRepo.find({ where: { nivel: 3, activo: true } });
    if (categorias.length === 0) {
      throw new BadRequestException('No hay categorías de nivel 3 disponibles para asignar CIs');
    }

    // Obtener usuarios disponibles para asignar como responsables
    const usuarios = await this.usuarioRepo.find({ where: { activo: true } });
    if (usuarios.length === 0) {
      throw new BadRequestException('No hay usuarios en el sistema para asociar como responsables');
    }

    // Obtener servicios N2 disponibles para asociar
    const serviciosN2 = await this.s2Repo.find({ where: { activo: true } });

    // Verificar cantidad actual
    const conteoActual = await this.ciRepo.count();
    if (conteoActual >= cantidadObjetivo && !dto.forzarReinicio) {
      // Si ya existen y no se fuerza reinicio, retornamos el reporte idempotente
      const conteosPorCat = await this.getConteoPorCategoria();
      return {
        semilla,
        totalDispositivos: conteoActual,
        insertados: 0,
        existentes: conteoActual,
        resumenPorNivel: { 'Nivel 3 (Clases de Dispositivos)': conteoActual },
        resumenPorCategoria: conteosPorCat,
        duracionMs: Date.now() - inicio,
      };
    }

    // Opciones sintéticas realistas
    const estados = ['operativo', 'operativo', 'operativo', 'mantenimiento', 'en_almacen'];
    const ubicaciones = [
      'Datacenter Central - Rack A01',
      'Datacenter Central - Rack A02',
      'Datacenter Central - Rack B01',
      'Datacenter Central - Rack B02',
      'Datacenter Respaldo - Sala B',
      'Edificio T3 - Laboratorio 101',
      'Edificio T3 - Laboratorio 102',
      'Edificio T1 - Oficinas Administrativas',
      'Edificio T7 - DTI Soporte',
      'Campus Central - Torre de Comunicaciones',
      'Nube AWS us-east-1 - VPC Producción',
      'Nube Azure East US - Virtual Network',
    ];
    const fabricantes = ['Dell Enterprise', 'HPE ProLiant', 'Cisco Systems', 'Lenovo Think', 'Fortinet', 'VMware', 'Oracle'];

    const faltantes = cantidadObjetivo - conteoActual;
    const lote = 500;
    let insertados = 0;

    for (let i = 0; i < faltantes; i += lote) {
      const cantidadEnEsteLote = Math.min(lote, faltantes - i);
      const cisParaInsertar: Partial<CmdbCi>[] = [];

      for (let j = 0; j < cantidadEnEsteLote; j++) {
        const globalIndex = conteoActual + i + j + 1;
        const cat = categorias[Math.floor(rng() * categorias.length)];
        const resp = usuarios[Math.floor(rng() * usuarios.length)];
        const estado = estados[Math.floor(rng() * estados.length)];
        const ubicacion = ubicaciones[Math.floor(rng() * ubicaciones.length)];
        const fab = fabricantes[Math.floor(rng() * fabricantes.length)];

        // Dispositivos que no requieren IP (racks pasivos, UPS aisladas, monitores, laptops offline, licencias)
        const noRequiereIp =
          cat.codigo.includes('RACK-42U') ||
          cat.codigo.includes('UPS-DC') ||
          cat.codigo.includes('SSL-CERT') ||
          cat.codigo.includes('S3-BUCKET');

        const tieneIp = !noRequiereIp;
        let ip: string | null = null;
        let mac: string | null = null;

        if (tieneIp) {
          const octeto3 = Math.floor(rng() * 254) + 1;
          const octeto4 = Math.floor(rng() * 254) + 1;
          ip = `10.14.${octeto3}.${octeto4}`;
          const hex = () => Math.floor(rng() * 256).toString(16).padStart(2, '0');
          mac = `00:1A:2B:${hex()}:${hex()}:${hex()}`.toUpperCase();
        }

        const codigo = `CI-${cat.codigo.replace('CI-CLASS-', '')}-${globalIndex.toString().padStart(5, '0')}`;
        const nombre = `${cat.nombre} #${globalIndex}`;

        cisParaInsertar.push({
          codigo,
          nombre,
          categoriaId: cat.id,
          estado,
          ubicacion,
          responsableId: resp.id,
          tieneIp,
          ip,
          mac,
          numeroSerie: `SN-${semilla.toString().slice(-4)}-${globalIndex.toString().padStart(6, '0')}`,
          modelo: `${fab} Mod-${Math.floor(rng() * 900) + 100}`,
          fabricante: fab,
          atributosTecnicos: JSON.stringify({
            nucleosCPU: tieneIp ? [2, 4, 8, 16, 32, 64][Math.floor(rng() * 6)] : null,
            memoriaRAM_GB: tieneIp ? [4, 8, 16, 32, 64, 128][Math.floor(rng() * 6)] : null,
            generacion: 2024 + Math.floor(rng() * 3),
            ambiente: ubicacion.includes('Nube') ? 'Cloud' : 'On-Premise',
          }),
          activo: true,
        });
      }

      await this.ciRepo.save(this.ciRepo.create(cisParaInsertar));
      insertados += cantidadEnEsteLote;
    }

    // Vincular muestra de CIs con Servicios N2 del catálogo (para trazabilidad ITIL)
    if (serviciosN2.length > 0) {
      const vinculosExistentes = await this.ciServicioRepo.count();
      if (vinculosExistentes < 50) {
        const primerosCis = await this.ciRepo.find({ take: 60 });
        const vinculos = primerosCis.map((ci, idx) => {
          const srv = serviciosN2[idx % serviciosN2.length];
          return this.ciServicioRepo.create({
            ciId: ci.id,
            servicioN2Id: srv.id,
            rolEnServicio: idx % 3 === 0 ? 'Infraestructura Principal' : 'Nodo de Respaldo / Secundario',
          });
        });
        await this.ciServicioRepo.save(vinculos);
      }
    }

    // Establecer relaciones técnicas iniciales representativas (depende_de, conectado_a, alojado_en)
    const relCount = await this.relacionRepo.count();
    if (relCount < 100) {
      const muestra = await this.ciRepo.find({ take: 80 });
      const relaciones: Partial<CmdbRelacion>[] = [];
      for (let k = 0; k < muestra.length - 2; k += 2) {
        // CI k depende de CI k+1 (e.g. Aplicación depende de Base de Datos o Servidor)
        relaciones.push({
          origenId: muestra[k].id,
          destinoId: muestra[k + 1].id,
          tipoRelacion: 'depende_de',
          descripcion: `Dependencia técnica operativa verificada`,
        });
        // CI k conectado a CI k+2 (e.g. Servidor conectado a Switch)
        if (k + 2 < muestra.length) {
          relaciones.push({
            origenId: muestra[k].id,
            destinoId: muestra[k + 2].id,
            tipoRelacion: 'conectado_a',
            descripcion: `Enlace de red Gigabit / Fibra`,
          });
        }
      }
      await this.relacionRepo.save(this.relacionRepo.create(relaciones));
    }

    const totalFinal = await this.ciRepo.count();
    const conteosPorCat = await this.getConteoPorCategoria();

    return {
      semilla,
      totalDispositivos: totalFinal,
      insertados,
      existentes: conteoActual,
      resumenPorNivel: { 'Nivel 3 (Clases de Dispositivos)': totalFinal },
      resumenPorCategoria: conteosPorCat,
      duracionMs: Date.now() - inicio,
    };
  }

  private async getConteoPorCategoria(): Promise<Record<string, number>> {
    const raw = await this.ciRepo
      .createQueryBuilder('ci')
      .innerJoin('ci.categoria', 'cat')
      .select('cat.nombre', 'categoria')
      .addSelect('COUNT(ci.id)', 'conteo')
      .groupBy('cat.nombre')
      .getRawMany();

    const resultado: Record<string, number> = {};
    for (const r of raw) {
      resultado[r.categoria] = parseInt(r.conteo, 10);
    }
    return resultado;
  }

  // ---------------------------------------------------------------------------
  // 3. Consultas Paginadas y Búsqueda sobre los >= 5,000 Dispositivos (P16)
  // ---------------------------------------------------------------------------
  async getCis(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoriaId?: number;
    estado?: string;
    ubicacion?: string;
    tieneIp?: boolean;
  }): Promise<{
    data: CmdbCi[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    duracionMs: number;
  }> {
    const inicio = Date.now();
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 25, 200);
    const skip = (page - 1) * limit;

    const qb = this.ciRepo
      .createQueryBuilder('ci')
      .leftJoinAndSelect('ci.categoria', 'categoria')
      .leftJoinAndSelect('ci.responsable', 'responsable')
      .where('ci.activo = :activo', { activo: true });

    if (query.search) {
      qb.andWhere('(ci.codigo LIKE :s OR ci.nombre LIKE :s OR ci.ip LIKE :s OR ci.numeroSerie LIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    if (query.categoriaId) {
      qb.andWhere('ci.categoriaId = :catId', { catId: query.categoriaId });
    }

    if (query.estado) {
      qb.andWhere('ci.estado = :est', { est: query.estado });
    }

    if (query.ubicacion) {
      qb.andWhere('ci.ubicacion LIKE :ub', { ub: `%${query.ubicacion}%` });
    }

    if (query.tieneIp !== undefined) {
      qb.andWhere('ci.tieneIp = :tip', { tip: query.tieneIp });
    }

    qb.orderBy('ci.id', 'ASC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const duracionMs = Date.now() - inicio;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      duracionMs,
    };
  }

  async getCiById(id: number): Promise<any> {
    const ci = await this.ciRepo.findOne({
      where: { id },
      relations: ['categoria', 'responsable'],
    });

    if (!ci) throw new NotFoundException(`Elemento de configuración ID ${id} no encontrado`);

    // Relaciones técnicas donde participa
    const relacionesOrigen = await this.relacionRepo.find({
      where: { origenId: id, activo: true },
      relations: ['destino', 'destino.categoria'],
    });

    const relacionesDestino = await this.relacionRepo.find({
      where: { destinoId: id, activo: true },
      relations: ['origen', 'origen.categoria'],
    });

    // Servicios N2 vinculados
    const vinculosServicios = await this.ciServicioRepo.find({
      where: { ciId: id },
      relations: ['servicioN2', 'servicioN2.servicioN1'],
    });

    return {
      ...ci,
      relacionesSalientes: relacionesOrigen,
      relacionesEntrantes: relacionesDestino,
      serviciosAsociados: vinculosServicios.map((v) => ({
        servicioN2: v.servicioN2,
        servicioN1: v.servicioN2.servicioN1,
        rolEnServicio: v.rolEnServicio,
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // 4. Relaciones Técnicas y Prevención Estricta de Ciclos (P04 & P14)
  // ---------------------------------------------------------------------------
  async createRelacion(dto: CreateCmdbRelacionDto): Promise<CmdbRelacion> {
    if (dto.origenId === dto.destinoId) {
      throw new BadRequestException('Un elemento de configuración no puede relacionarse consigo mismo');
    }

    const [origen, destino] = await Promise.all([
      this.ciRepo.findOne({ where: { id: dto.origenId } }),
      this.ciRepo.findOne({ where: { id: dto.destinoId } }),
    ]);

    if (!origen) throw new NotFoundException(`CI de origen ID ${dto.origenId} no existe`);
    if (!destino) throw new NotFoundException(`CI de destino ID ${dto.destinoId} no existe`);

    // Validación de anti-ciclos para 'depende_de'
    // Si A depende de B, verificamos mediante DFS si B ya depende de A (directa o indirectamente)
    if (dto.tipoRelacion === 'depende_de') {
      const createsCycle = await this.detectCycleInDependency(dto.destinoId, dto.origenId);
      if (createsCycle) {
        throw new BadRequestException(
          `Detección de ciclo prohibido: el CI ${dto.destinoId} ya depende directa o indirectamente del CI ${dto.origenId}`,
        );
      }
    }

    // Verificar si ya existe relación idéntica
    const existing = await this.relacionRepo.findOne({
      where: {
        origenId: dto.origenId,
        destinoId: dto.destinoId,
        tipoRelacion: dto.tipoRelacion,
        activo: true,
      },
    });

    if (existing) {
      return existing;
    }

    const rel = this.relacionRepo.create({
      origenId: dto.origenId,
      destinoId: dto.destinoId,
      tipoRelacion: dto.tipoRelacion,
      descripcion: dto.descripcion ?? null,
      activo: true,
    });

    return this.relacionRepo.save(rel);
  }

  // Algoritmo DFS para detección de ciclo en grafo dirigido de dependencias
  private async detectCycleInDependency(fromId: number, targetId: number): Promise<boolean> {
    const visited = new Set<number>();
    const queue: number[] = [fromId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === targetId) return true;

      if (!visited.has(current)) {
        visited.add(current);
        const outgoing = await this.relacionRepo.find({
          where: { origenId: current, tipoRelacion: 'depende_de', activo: true },
        });

        for (const edge of outgoing) {
          if (edge.destinoId === targetId) return true;
          if (!visited.has(edge.destinoId)) {
            queue.push(edge.destinoId);
          }
        }
      }
    }

    return false;
  }

  async vincularCiConServicio(dto: VincularCiServicioDto): Promise<CmdbCiServicio> {
    const [ci, s2] = await Promise.all([
      this.ciRepo.findOne({ where: { id: dto.ciId } }),
      this.s2Repo.findOne({ where: { id: dto.servicioN2Id } }),
    ]);

    if (!ci) throw new NotFoundException(`CI ID ${dto.ciId} no encontrado`);
    if (!s2) throw new NotFoundException(`Servicio N2 ID ${dto.servicioN2Id} no encontrado`);

    const existing = await this.ciServicioRepo.findOne({
      where: { ciId: dto.ciId, servicioN2Id: dto.servicioN2Id },
    });

    if (existing) {
      existing.rolEnServicio = dto.rolEnServicio ?? existing.rolEnServicio;
      return this.ciServicioRepo.save(existing);
    }

    const vinculo = this.ciServicioRepo.create({
      ciId: dto.ciId,
      servicioN2Id: dto.servicioN2Id,
      rolEnServicio: dto.rolEnServicio ?? 'Componente Operativo',
    });

    return this.ciServicioRepo.save(vinculo);
  }

  // ---------------------------------------------------------------------------
  // 5. Recorrido de Dependencias y Análisis de Impacto (Graph Engineering - P14)
  // ---------------------------------------------------------------------------
  async getImpactedServices(ciId: number): Promise<{
    ciConsultado: { id: number; codigo: string; nombre: string; estado: string };
    cadenaDependencias: Array<{ id: number; codigo: string; nombre: string; profundidad: number }>;
    serviciosPotencialmenteAfectadosN2: Array<{
      id: number;
      codigo: string;
      nombre: string;
      criticidad?: string;
      servicioN1: { id: number; codigo: string; nombre: string };
    }>;
    serviciosPotencialmenteAfectadosN1: Array<{ id: number; codigo: string; nombre: string }>;
    totalCisEnCadena: number;
    totalServiciosN2Afectados: number;
    totalServiciosN1Afectados: number;
    disclaimer: string;
  }> {
    const rootCi = await this.ciRepo.findOne({ where: { id: ciId } });
    if (!rootCi) throw new NotFoundException(`CI ID ${ciId} no encontrado`);

    // Transitive impact traversal:
    // Si el CI X falla o tiene cambio, cualquier CI Y que dependa de X ("Y depende_de X") se ve afectado.
    const impactedCiIds = new Map<number, number>(); // ciId -> depth
    impactedCiIds.set(ciId, 0);

    const queue: Array<{ id: number; depth: number }> = [{ id: ciId, depth: 0 }];
    const visited = new Set<number>([ciId]);

    while (queue.length > 0) {
      const { id: currentId, depth } = queue.shift()!;

      // Encontrar todos los CI donde destinoId === currentId y tipoRelacion === 'depende_de'
      // O donde destinoId === currentId y tipoRelacion === 'alojado_en' (los alojados dentro se ven afectados)
      const incomingDependencies = await this.relacionRepo.find({
        where: [
          { destinoId: currentId, tipoRelacion: 'depende_de', activo: true },
          { destinoId: currentId, tipoRelacion: 'alojado_en', activo: true },
        ],
      });

      for (const rel of incomingDependencies) {
        if (!visited.has(rel.origenId)) {
          visited.add(rel.origenId);
          impactedCiIds.set(rel.origenId, depth + 1);
          queue.push({ id: rel.origenId, depth: depth + 1 });
        }
      }
    }

    const allCiIds = Array.from(impactedCiIds.keys());
    const cisInCadena = await this.ciRepo.find({
      where: { id: In(allCiIds) },
    });

    const cadenaDetalle = cisInCadena.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      nombre: c.nombre,
      profundidad: impactedCiIds.get(c.id) ?? 0,
    }));

    // Buscar todos los servicios N2 vinculados a cualquiera de estos CIs
    const vinculosServicios = await this.ciServicioRepo.find({
      where: { ciId: In(allCiIds) },
      relations: ['servicioN2', 'servicioN2.servicioN1', 'servicioN2.criticidad'],
    });

    const srvN2Map = new Map<number, any>();
    const srvN1Map = new Map<number, any>();

    for (const v of vinculosServicios) {
      if (v.servicioN2 && !srvN2Map.has(v.servicioN2.id)) {
        srvN2Map.set(v.servicioN2.id, {
          id: v.servicioN2.id,
          codigo: v.servicioN2.codigo,
          nombre: v.servicioN2.nombre,
          criticidad: v.servicioN2.criticidad?.nombre ?? 'Normal',
          servicioN1: {
            id: v.servicioN2.servicioN1.id,
            codigo: v.servicioN2.servicioN1.codigo,
            nombre: v.servicioN2.servicioN1.nombre,
          },
        });

        if (v.servicioN2.servicioN1 && !srvN1Map.has(v.servicioN2.servicioN1.id)) {
          srvN1Map.set(v.servicioN2.servicioN1.id, {
            id: v.servicioN2.servicioN1.id,
            codigo: v.servicioN2.servicioN1.codigo,
            nombre: v.servicioN2.servicioN1.nombre,
          });
        }
      }
    }

    return {
      ciConsultado: {
        id: rootCi.id,
        codigo: rootCi.codigo,
        nombre: rootCi.nombre,
        estado: rootCi.estado,
      },
      cadenaDependencias: cadenaDetalle,
      serviciosPotencialmenteAfectadosN2: Array.from(srvN2Map.values()),
      serviciosPotencialmenteAfectadosN1: Array.from(srvN1Map.values()),
      totalCisEnCadena: cadenaDetalle.length,
      totalServiciosN2Afectados: srvN2Map.size,
      totalServiciosN1Afectados: srvN1Map.size,
      disclaimer:
        'Servicios potencialmente afectados según recorrido del grafo de dependencias técnicas. Una dependencia estructural no implica necesariamente una interrupción efectiva inmediata del servicio.',
    };
  }
}
