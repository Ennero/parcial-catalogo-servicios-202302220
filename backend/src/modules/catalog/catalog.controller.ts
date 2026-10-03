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
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../entities/usuario.entity';
import {
  CreateServicioN1Dto,
  UpdateServicioN1Dto,
  CreateServicioN2Dto,
  UpdateServicioN2Dto,
  FilterServiciosQueryDto,
} from './dto/catalog.dto';

@Controller('api/catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ================= CATÁLOGOS CONTROLADOS =================
  @Get('clases')
  async getClases() {
    return this.catalogService.getClases();
  }

  @Get('criticidades')
  async getCriticidades() {
    return this.catalogService.getCriticidades();
  }

  @Get('tipos')
  async getTipos() {
    return this.catalogService.getTipos();
  }

  // ================= SERVICIOS NIVEL 1 =================
  @Get('n1')
  async getServiciosN1() {
    return this.catalogService.getServiciosN1();
  }

  @Get('n1/:id')
  async getServicioN1ById(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getServicioN1ById(id);
  }

  @Post('n1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createServicioN1(@Body() dto: CreateServicioN1Dto) {
    return this.catalogService.createServicioN1(dto);
  }

  @Put('n1/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateServicioN1(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioN1Dto,
  ) {
    return this.catalogService.updateServicioN1(id, dto);
  }

  // ================= SERVICIOS NIVEL 2 =================
  @Get('n2')
  async getServiciosN2(@Query() query: FilterServiciosQueryDto) {
    return this.catalogService.getServiciosN2(query);
  }

  @Get('n2/:id')
  async getServicioN2ById(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.getServicioN2ById(id);
  }

  @Post('n2')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createServicioN2(@Body() dto: CreateServicioN2Dto) {
    return this.catalogService.createServicioN2(dto);
  }

  @Put('n2/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateServicioN2(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServicioN2Dto,
  ) {
    return this.catalogService.updateServicioN2(id, dto);
  }
}
