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
  Request,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import {
  CreateColaDto,
  UpdateColaDto,
  AsignarUsuarioColaDto,
  AsignarRolColaDto,
} from './dto/queue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/usuario.entity';

@Controller('colas')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get()
  async getColas() {
    return this.queueService.getColas();
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async seedColas() {
    return this.queueService.seedDefaultQueues();
  }

  @Get(':id')
  async getColaById(@Param('id', ParseIntPipe) id: number) {
    return this.queueService.getColaById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createCola(@Body() dto: CreateColaDto) {
    return this.queueService.createCola(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async updateCola(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateColaDto,
    @Request() req: any,
  ) {
    return this.queueService.updateCola(id, dto, req.user);
  }

  @Post('asignar-usuario')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async asignarUsuario(@Body() dto: AsignarUsuarioColaDto) {
    return this.queueService.asignarUsuarioACola(dto);
  }

  @Post('asignar-rol')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async asignarRol(@Body() dto: AsignarRolColaDto) {
    return this.queueService.asignarRolACola(dto);
  }

  @Get(':id/permiso')
  @UseGuards(JwtAuthGuard)
  async verificarPermiso(
    @Param('id', ParseIntPipe) id: number,
    @Query('accion') accion: 'consultar' | 'atender' | 'transferir' | 'aprobar' | 'administrar',
    @Request() req: any,
  ) {
    const tienePermiso = await this.queueService.verificarPermiso(req.user, id, accion);
    return { colaId: id, accion, permitido: tienePermiso };
  }
}
