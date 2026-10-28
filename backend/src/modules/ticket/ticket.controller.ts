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
import { TicketService } from './ticket.service';
import {
  CreateTicketDto,
  UpdateEstadoTicketDto,
  TransferirTicketDto,
  ReabrirTicketDto,
  CreateComentarioDto,
  RelacionarTicketsDto,
  CreateFaqDto,
} from './dto/ticket.dto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../entities/usuario.entity';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async getTickets(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('proceso') proceso?: string,
    @Query('colaId') colaId?: number,
    @Query('estado') estado?: string,
    @Query('prioridad') prioridad?: string,
    @Query('responsableId') responsableId?: number,
    @Query('servicioN2Id') servicioN2Id?: number,
    @Request() req?: any,
  ) {
    return this.ticketService.getTickets(
      {
        page,
        limit,
        search,
        proceso,
        colaId,
        estado,
        prioridad,
        responsableId,
        servicioN2Id,
      },
      req.user,
    );
  }

  @Get('metricas/dashboard')
  async getDashboardMetrics() {
    return this.ticketService.getDashboardMetrics();
  }

  @Post('seed-demo')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async seedDemo() {
    return this.ticketService.seedDemoTickets();
  }

  @Get('faqs')
  async getFaqs(@Query('search') search?: string) {
    return this.ticketService.getFaqs(search);
  }

  @Post('faqs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  async createFaq(@Body() dto: CreateFaqDto) {
    return this.ticketService.createFaq(dto);
  }

  @Post('faqs/:id/util')
  async marcarUtilFaq(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.marcarUtilFaq(id);
  }

  @Get(':id')
  async getTicketById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ticketService.getTicketById(id, req.user);
  }

  @Post()
  async createTicket(@Body() dto: CreateTicketDto, @Request() req: any) {
    return this.ticketService.createTicket(dto, req.user);
  }

  @Post(':id/tomar')
  async tomarTicket(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ticketService.tomarTicketConcurrente(id, req.user);
  }

  @Put(':id/estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoTicketDto,
    @Request() req: any,
  ) {
    return this.ticketService.cambiarEstado(id, dto, req.user);
  }

  @Put(':id/transferir')
  async transferirTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferirTicketDto,
    @Request() req: any,
  ) {
    return this.ticketService.transferirTicket(id, dto, req.user);
  }

  @Post(':id/reabrir')
  async reabrirTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReabrirTicketDto,
    @Request() req: any,
  ) {
    return this.ticketService.reabrirTicket(id, dto, req.user);
  }

  @Post(':id/comentarios')
  async addComentario(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateComentarioDto,
    @Request() req: any,
  ) {
    return this.ticketService.addComentario(id, dto, req.user);
  }

  @Post(':id/relacionar')
  async relacionarTickets(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RelacionarTicketsDto,
    @Request() req: any,
  ) {
    return this.ticketService.relacionarTickets(id, dto, req.user);
  }
}
