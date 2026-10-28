import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import {
  ColaAtencion,
  ColaUsuario,
  ColaRol,
  Usuario,
  Ticket,
  TicketBitacora,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ColaAtencion,
      ColaUsuario,
      ColaRol,
      Usuario,
      Ticket,
      TicketBitacora,
    ]),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
