import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import {
  Ticket,
  TicketComentario,
  TicketAdjunto,
  TicketBitacora,
  TicketRelacion,
  TicketCi,
  FaqArticulo,
  Usuario,
  ServicioN1,
  ServicioN2,
  ColaAtencion,
  CmdbCi,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      TicketComentario,
      TicketAdjunto,
      TicketBitacora,
      TicketRelacion,
      TicketCi,
      FaqArticulo,
      Usuario,
      ServicioN1,
      ServicioN2,
      ColaAtencion,
      CmdbCi,
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
