import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../../entities/empresa.entity';
import { Area } from '../../entities/area.entity';
import { Departamento } from '../../entities/departamento.entity';
import { Seccion } from '../../entities/seccion.entity';
import { Puesto } from '../../entities/puesto.entity';
import { Usuario } from '../../entities/usuario.entity';
import { ServicioN2 } from '../../entities/servicio-n2.entity';
import * as bcrypt from 'bcryptjs';
import {
  CreateEmpresaDto,
  UpdateEmpresaDto,
  CreateAreaDto,
  UpdateAreaDto,
  CreateDepartamentoDto,
  UpdateDepartamentoDto,
  CreateSeccionDto,
  UpdateSeccionDto,
  CreatePuestoDto,
  UpdatePuestoDto,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './dto/organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(Area)
    private readonly areaRepo: Repository<Area>,
    @InjectRepository(Departamento)
    private readonly deptoRepo: Repository<Departamento>,
    @InjectRepository(Seccion)
    private readonly seccionRepo: Repository<Seccion>,
    @InjectRepository(Puesto)
    private readonly puestoRepo: Repository<Puesto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(ServicioN2)
    private readonly servicioRepo: Repository<ServicioN2>,
  ) {}

  // ================= EMPRESA =================
  async getEmpresas(): Promise<Empresa[]> {
    return this.empresaRepo.find({ order: { codigo: 'ASC' } });
  }

  async getEmpresaById(id: number): Promise<Empresa> {
    const item = await this.empresaRepo.findOne({ where: { id }, relations: ['areas'] });
    if (!item) throw new NotFoundException(`Empresa con ID ${id} no encontrada.`);
    return item;
  }

  async createEmpresa(dto: CreateEmpresaDto): Promise<Empresa> {
    const exists = await this.empresaRepo.findOne({ where: { codigo: dto.codigo } });
    if (exists) {
      throw new ConflictException(`Ya existe una empresa con el código '${dto.codigo}'.`);
    }
    const empresa = this.empresaRepo.create(dto);
    return this.empresaRepo.save(empresa);
  }

  async updateEmpresa(id: number, dto: UpdateEmpresaDto): Promise<Empresa> {
    const empresa = await this.getEmpresaById(id);

    // Política restrictiva de baja lógica
    if (dto.activo === false && empresa.activo === true) {
      const activeAreasCount = await this.areaRepo.count({
        where: { empresaId: id, activo: true },
      });
      if (activeAreasCount > 0) {
        throw new BadRequestException(
          `No se puede desactivar la Empresa '${empresa.nombre}' porque contiene ${activeAreasCount} área(s) activa(s). Desactive o reasigne las áreas dependientes primero.`,
        );
      }
    }

    Object.assign(empresa, dto);
    return this.empresaRepo.save(empresa);
  }

  // ================= AREA =================
  async getAreas(empresaId?: number): Promise<Area[]> {
    const where = empresaId ? { empresaId } : {};
    return this.areaRepo.find({
      where,
      relations: ['empresa'],
      order: { codigo: 'ASC' },
    });
  }

  async getAreaById(id: number): Promise<Area> {
    const item = await this.areaRepo.findOne({
      where: { id },
      relations: ['empresa', 'departamentos'],
    });
    if (!item) throw new NotFoundException(`Área con ID ${id} no encontrada.`);
    return item;
  }

  async createArea(dto: CreateAreaDto): Promise<Area> {
    const parent = await this.empresaRepo.findOne({ where: { id: dto.empresaId } });
    if (!parent) {
      throw new NotFoundException(`Empresa con ID ${dto.empresaId} no existe.`);
    }
    if (!parent.activo) {
      throw new BadRequestException(`No se puede asociar un área a una Empresa inactiva.`);
    }

    const exists = await this.areaRepo.findOne({
      where: { empresaId: dto.empresaId, codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un área con el código '${dto.codigo}' en la empresa '${parent.nombre}'.`,
      );
    }

    const area = this.areaRepo.create(dto);
    return this.areaRepo.save(area);
  }

  async updateArea(id: number, dto: UpdateAreaDto): Promise<Area> {
    const area = await this.getAreaById(id);

    // Política restrictiva de baja lógica
    if (dto.activo === false && area.activo === true) {
      const activeDeptosCount = await this.deptoRepo.count({
        where: { areaId: id, activo: true },
      });
      if (activeDeptosCount > 0) {
        throw new BadRequestException(
          `No se puede desactivar el Área '${area.nombre}' porque contiene ${activeDeptosCount} departamento(s) activo(s). Desactive o reasigne los departamentos subordinados primero.`,
        );
      }
    }

    Object.assign(area, dto);
    return this.areaRepo.save(area);
  }

  // ================= DEPARTAMENTO =================
  async getDepartamentos(areaId?: number): Promise<Departamento[]> {
    const where = areaId ? { areaId } : {};
    return this.deptoRepo.find({
      where,
      relations: ['area', 'area.empresa'],
      order: { codigo: 'ASC' },
    });
  }

  async getDepartamentoById(id: number): Promise<Departamento> {
    const item = await this.deptoRepo.findOne({
      where: { id },
      relations: ['area', 'area.empresa', 'secciones'],
    });
    if (!item) throw new NotFoundException(`Departamento con ID ${id} no encontrado.`);
    return item;
  }

  async createDepartamento(dto: CreateDepartamentoDto): Promise<Departamento> {
    const parent = await this.areaRepo.findOne({ where: { id: dto.areaId } });
    if (!parent) {
      throw new NotFoundException(`Área con ID ${dto.areaId} no existe.`);
    }
    if (!parent.activo) {
      throw new BadRequestException(`No se puede asociar un departamento a un Área inactiva.`);
    }

    const exists = await this.deptoRepo.findOne({
      where: { areaId: dto.areaId, codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un departamento con el código '${dto.codigo}' en el área '${parent.nombre}'.`,
      );
    }

    const depto = this.deptoRepo.create(dto);
    return this.deptoRepo.save(depto);
  }

  async updateDepartamento(id: number, dto: UpdateDepartamentoDto): Promise<Departamento> {
    const depto = await this.getDepartamentoById(id);

    // Política restrictiva de baja lógica
    if (dto.activo === false && depto.activo === true) {
      const activeSecCount = await this.seccionRepo.count({
        where: { departamentoId: id, activo: true },
      });
      if (activeSecCount > 0) {
        throw new BadRequestException(
          `No se puede desactivar el Departamento '${depto.nombre}' porque contiene ${activeSecCount} sección(es) activa(s). Desactive o reasigne las secciones dependientes primero.`,
        );
      }
    }

    Object.assign(depto, dto);
    return this.deptoRepo.save(depto);
  }

  // ================= SECCION =================
  async getSecciones(departamentoId?: number): Promise<Seccion[]> {
    const where = departamentoId ? { departamentoId } : {};
    return this.seccionRepo.find({
      where,
      relations: ['departamento', 'departamento.area'],
      order: { codigo: 'ASC' },
    });
  }

  async getSeccionById(id: number): Promise<Seccion> {
    const item = await this.seccionRepo.findOne({
      where: { id },
      relations: ['departamento', 'departamento.area', 'puestos'],
    });
    if (!item) throw new NotFoundException(`Sección con ID ${id} no encontrada.`);
    return item;
  }

  async createSeccion(dto: CreateSeccionDto): Promise<Seccion> {
    const parent = await this.deptoRepo.findOne({ where: { id: dto.departamentoId } });
    if (!parent) {
      throw new NotFoundException(`Departamento con ID ${dto.departamentoId} no existe.`);
    }
    if (!parent.activo) {
      throw new BadRequestException(`No se puede asociar una sección a un Departamento inactivo.`);
    }

    const exists = await this.seccionRepo.findOne({
      where: { departamentoId: dto.departamentoId, codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe una sección con el código '${dto.codigo}' en el departamento '${parent.nombre}'.`,
      );
    }

    const seccion = this.seccionRepo.create(dto);
    return this.seccionRepo.save(seccion);
  }

  async updateSeccion(id: number, dto: UpdateSeccionDto): Promise<Seccion> {
    const seccion = await this.getSeccionById(id);

    // Política restrictiva de baja lógica
    if (dto.activo === false && seccion.activo === true) {
      const activePuestosCount = await this.puestoRepo.count({
        where: { seccionId: id, activo: true },
      });
      if (activePuestosCount > 0) {
        throw new BadRequestException(
          `No se puede desactivar la Sección '${seccion.nombre}' porque contiene ${activePuestosCount} puesto(s) activo(s). Desactive los puestos dependientes primero.`,
        );
      }

      const activeServicesCount = await this.servicioRepo.count({
        where: { seccionResponsableId: id, activo: true },
      });
      if (activeServicesCount > 0) {
        throw new BadRequestException(
          `No se puede desactivar la Sección '${seccion.nombre}' porque tiene ${activeServicesCount} servicio(s) TI asignado(s) bajo su responsabilidad. Reasigne los servicios a otra sección activa antes de desactivar.`,
        );
      }
    }

    Object.assign(seccion, dto);
    return this.seccionRepo.save(seccion);
  }

  // ================= PUESTO =================
  async getPuestos(seccionId?: number): Promise<Puesto[]> {
    const where = seccionId ? { seccionId } : {};
    return this.puestoRepo.find({
      where,
      relations: ['seccion', 'seccion.departamento'],
      order: { codigo: 'ASC' },
    });
  }

  async getPuestoById(id: number): Promise<Puesto> {
    const item = await this.puestoRepo.findOne({
      where: { id },
      relations: ['seccion', 'seccion.departamento', 'usuarios'],
    });
    if (!item) throw new NotFoundException(`Puesto con ID ${id} no encontrado.`);
    return item;
  }

  async createPuesto(dto: CreatePuestoDto): Promise<Puesto> {
    const parent = await this.seccionRepo.findOne({ where: { id: dto.seccionId } });
    if (!parent) {
      throw new NotFoundException(`Sección con ID ${dto.seccionId} no existe.`);
    }
    if (!parent.activo) {
      throw new BadRequestException(`No se puede asociar un puesto a una Sección inactiva.`);
    }

    const exists = await this.puestoRepo.findOne({
      where: { seccionId: dto.seccionId, codigo: dto.codigo },
    });
    if (exists) {
      throw new ConflictException(
        `Ya existe un puesto con el código '${dto.codigo}' en la sección '${parent.nombre}'.`,
      );
    }

    const puesto = this.puestoRepo.create(dto);
    return this.puestoRepo.save(puesto);
  }

  async updatePuesto(id: number, dto: UpdatePuestoDto): Promise<Puesto> {
    const puesto = await this.getPuestoById(id);

    // Política restrictiva de baja lógica
    if (dto.activo === false && puesto.activo === true) {
      const activeUsersCount = await this.usuarioRepo.count({
        where: { puestoId: id, activo: true },
      });
      if (activeUsersCount > 0) {
        throw new BadRequestException(
          `No se puede desactivar el Puesto '${puesto.nombre}' porque contiene ${activeUsersCount} usuario(s) activo(s). Reasigne o desactive los usuarios antes de desactivar el puesto.`,
        );
      }
    }

    Object.assign(puesto, dto);
    return this.puestoRepo.save(puesto);
  }

  // ================= USUARIO =================
  async getUsuarios(): Promise<Partial<Usuario>[]> {
    const users = await this.usuarioRepo.find({
      relations: ['puesto', 'puesto.seccion', 'puesto.seccion.departamento', 'puesto.seccion.departamento.area', 'puesto.seccion.departamento.area.empresa'],
      order: { nombre: 'ASC' },
    });
    return users.map((u) => this.sanitizeUser(u));
  }

  async getUsuarioById(id: number): Promise<Partial<Usuario>> {
    const user = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['puesto', 'puesto.seccion', 'puesto.seccion.departamento', 'puesto.seccion.departamento.area', 'puesto.seccion.departamento.area.empresa'],
    });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    return this.sanitizeUser(user);
  }

  async createUsuario(dto: CreateUsuarioDto): Promise<Partial<Usuario>> {
    const existsUsername = await this.usuarioRepo.findOne({ where: { username: dto.username } });
    if (existsUsername) {
      throw new ConflictException(`El nombre de usuario '${dto.username}' ya está registrado.`);
    }

    const existsEmail = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existsEmail) {
      throw new ConflictException(`El correo electrónico '${dto.email}' ya está registrado.`);
    }

    if (dto.puestoId) {
      const puesto = await this.puestoRepo.findOne({ where: { id: dto.puestoId } });
      if (!puesto) {
        throw new NotFoundException(`El puesto con ID ${dto.puestoId} no existe.`);
      }
      if (!puesto.activo) {
        throw new BadRequestException(`No se puede asignar un usuario a un Puesto inactivo.`);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const usuario = this.usuarioRepo.create({
      ...dto,
      passwordHash,
    });

    const saved = await this.usuarioRepo.save(usuario);
    return this.sanitizeUser(saved);
  }

  async updateUsuario(id: number, dto: UpdateUsuarioDto): Promise<Partial<Usuario>> {
    const user = await this.usuarioRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);

    if (dto.email && dto.email !== user.email) {
      const existsEmail = await this.usuarioRepo.findOne({ where: { email: dto.email } });
      if (existsEmail) throw new ConflictException(`El correo '${dto.email}' ya está registrado.`);
    }

    if (dto.puestoId) {
      const puesto = await this.puestoRepo.findOne({ where: { id: dto.puestoId } });
      if (!puesto) throw new NotFoundException(`Puesto con ID ${dto.puestoId} no existe.`);
      if (!puesto.activo) {
        throw new BadRequestException(`No se puede asignar un usuario a un Puesto inactivo.`);
      }
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    if (dto.nombre !== undefined) user.nombre = dto.nombre;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.rol !== undefined) user.rol = dto.rol;
    if (dto.activo !== undefined) user.activo = dto.activo;
    if (dto.puestoId !== undefined) user.puestoId = dto.puestoId;

    const updated = await this.usuarioRepo.save(user);
    return this.sanitizeUser(updated);
  }

  // ================= ORGANIZATIONAL TREE =================
  async getOrganizationalTree(): Promise<any> {
    const empresas = await this.empresaRepo.find({
      relations: [
        'areas',
        'areas.departamentos',
        'areas.departamentos.secciones',
        'areas.departamentos.secciones.puestos',
        'areas.departamentos.secciones.puestos.usuarios',
      ],
      order: { codigo: 'ASC' },
    });

    // Sanitizar contraseñas recursivamente
    return empresas.map((emp) => ({
      id: emp.id,
      codigo: emp.codigo,
      nombre: emp.nombre,
      activo: emp.activo,
      areas: emp.areas.map((area) => ({
        id: area.id,
        codigo: area.codigo,
        nombre: area.nombre,
        activo: area.activo,
        departamentos: area.departamentos.map((depto) => ({
          id: depto.id,
          codigo: depto.codigo,
          nombre: depto.nombre,
          activo: depto.activo,
          secciones: depto.secciones.map((sec) => ({
            id: sec.id,
            codigo: sec.codigo,
            nombre: sec.nombre,
            activo: sec.activo,
            puestos: sec.puestos.map((pst) => ({
              id: pst.id,
              codigo: pst.codigo,
              nombre: pst.nombre,
              activo: pst.activo,
              usuarios: pst.usuarios.map((u) => ({
                id: u.id,
                nombre: u.nombre,
                username: u.username,
                email: u.email,
                rol: u.rol,
                activo: u.activo,
              })),
            })),
          })),
        })),
      })),
    }));
  }

  private sanitizeUser(user: Usuario): Partial<Usuario> {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
