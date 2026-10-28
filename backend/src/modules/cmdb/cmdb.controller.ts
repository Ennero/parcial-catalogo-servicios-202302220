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
import { CmdbService } from './cmdb.service';
import {
  CreateCmdbCategoriaDto,
  CreateCmdbCiDto,
  CreateCmdbRelacionDto,
  VincularCiServicioDto,
  GenerarCisDto,
} from './dto/cmdb.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../entities/usuario.entity';

@Controller(['api/cmdb', 'cmdb'])
export class CmdbController {
  constructor(private readonly cmdbService: CmdbService) {}

  @Get('categorias')
  async getCategorias() {
    return this.cmdbService.getCategorias();
  }

  @Post('categorias/seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async seedCategorias() {
    return this.cmdbService.seedCategories();
  }

  @Post('categorias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createCategoria(@Body() dto: CreateCmdbCategoriaDto) {
    return this.cmdbService.createCategoria(dto);
  }

  @Put('categorias/:id/parent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateCategoriaParent(
    @Param('id', ParseIntPipe) id: number,
    @Body('parentId') parentId: number | null,
  ) {
    return this.cmdbService.updateCategoriaParent(id, parentId);
  }

  @Post('generar-sinteticos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async generarDispositivos(@Body() dto: GenerarCisDto) {
    return this.cmdbService.generateSyntheticDevices(dto);
  }

  @Get('cis')
  async getCis(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoriaId') categoriaId?: number,
    @Query('estado') estado?: string,
    @Query('ubicacion') ubicacion?: string,
    @Query('tieneIp') tieneIp?: boolean,
  ) {
    return this.cmdbService.getCis({
      page,
      limit,
      search,
      categoriaId,
      estado,
      ubicacion,
      tieneIp,
    });
  }

  @Get('cis/:id')
  async getCiById(@Param('id', ParseIntPipe) id: number) {
    return this.cmdbService.getCiById(id);
  }

  @Post('relaciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createRelacion(@Body() dto: CreateCmdbRelacionDto) {
    return this.cmdbService.createRelacion(dto);
  }

  @Post('vincular-servicio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async vincularCiServicio(@Body() dto: VincularCiServicioDto) {
    return this.cmdbService.vincularCiConServicio(dto);
  }

  @Get('cis/:id/impacto')
  async getImpactedServices(@Param('id', ParseIntPipe) id: number) {
    return this.cmdbService.getImpactedServices(id);
  }
}
