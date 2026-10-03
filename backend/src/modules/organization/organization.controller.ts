import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../entities/usuario.entity';
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

@Controller('api/organization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  // ================= TREE =================
  @Get('tree')
  async getTree() {
    return this.orgService.getOrganizationalTree();
  }

  // ================= EMPRESA =================
  @Get('empresas')
  async getEmpresas() {
    return this.orgService.getEmpresas();
  }

  @Get('empresas/:id')
  async getEmpresaById(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getEmpresaById(id);
  }

  @Post('empresas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createEmpresa(@Body() dto: CreateEmpresaDto) {
    return this.orgService.createEmpresa(dto);
  }

  @Put('empresas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpresaDto,
  ) {
    return this.orgService.updateEmpresa(id, dto);
  }

  // ================= AREA =================
  @Get('areas')
  async getAreas(@Query('empresaId') empresaId?: string) {
    return this.orgService.getAreas(empresaId ? parseInt(empresaId, 10) : undefined);
  }

  @Get('areas/:id')
  async getAreaById(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getAreaById(id);
  }

  @Post('areas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createArea(@Body() dto: CreateAreaDto) {
    return this.orgService.createArea(dto);
  }

  @Put('areas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateArea(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAreaDto,
  ) {
    return this.orgService.updateArea(id, dto);
  }

  // ================= DEPARTAMENTO =================
  @Get('departamentos')
  async getDepartamentos(@Query('areaId') areaId?: string) {
    return this.orgService.getDepartamentos(areaId ? parseInt(areaId, 10) : undefined);
  }

  @Get('departamentos/:id')
  async getDepartamentoById(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getDepartamentoById(id);
  }

  @Post('departamentos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createDepartamento(@Body() dto: CreateDepartamentoDto) {
    return this.orgService.createDepartamento(dto);
  }

  @Put('departamentos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateDepartamento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartamentoDto,
  ) {
    return this.orgService.updateDepartamento(id, dto);
  }

  // ================= SECCION =================
  @Get('secciones')
  async getSecciones(@Query('departamentoId') departamentoId?: string) {
    return this.orgService.getSecciones(departamentoId ? parseInt(departamentoId, 10) : undefined);
  }

  @Get('secciones/:id')
  async getSeccionById(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getSeccionById(id);
  }

  @Post('secciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createSeccion(@Body() dto: CreateSeccionDto) {
    return this.orgService.createSeccion(dto);
  }

  @Put('secciones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateSeccion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSeccionDto,
  ) {
    return this.orgService.updateSeccion(id, dto);
  }

  // ================= PUESTO =================
  @Get('puestos')
  async getPuestos(@Query('seccionId') seccionId?: string) {
    return this.orgService.getPuestos(seccionId ? parseInt(seccionId, 10) : undefined);
  }

  @Get('puestos/:id')
  async getPuestoById(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getPuestoById(id);
  }

  @Post('puestos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createPuesto(@Body() dto: CreatePuestoDto) {
    return this.orgService.createPuesto(dto);
  }

  @Put('puestos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updatePuesto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePuestoDto,
  ) {
    return this.orgService.updatePuesto(id, dto);
  }

  // ================= USUARIO =================
  @Get('usuarios')
  async getUsuarios() {
    return this.orgService.getUsuarios();
  }

  @Get('usuarios/:id')
  async getUsuarioById(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getUsuarioById(id);
  }

  @Post('usuarios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createUsuario(@Body() dto: CreateUsuarioDto) {
    return this.orgService.createUsuario(dto);
  }

  @Put('usuarios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.orgService.updateUsuario(id, dto);
  }
}
