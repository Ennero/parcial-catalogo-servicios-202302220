import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioN1 } from '../../entities/servicio-n1.entity';
import { ServicioN2 } from '../../entities/servicio-n2.entity';
import { ClaseServicio } from '../../entities/clase-servicio.entity';
import { CriticidadServicio } from '../../entities/criticidad-servicio.entity';
import { TipoServicio } from '../../entities/tipo-servicio.entity';
import { ImportacionLog } from '../../entities/importacion-log.entity';
import { ImportacionObservacion } from '../../entities/importacion-observacion.entity';
import { ImporterService } from './importer.service';
import { ImporterController } from './importer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServicioN1,
      ServicioN2,
      ClaseServicio,
      CriticidadServicio,
      TipoServicio,
      ImportacionLog,
      ImportacionObservacion,
    ]),
  ],
  controllers: [ImporterController],
  providers: [ImporterService],
  exports: [ImporterService],
})
export class ImporterModule {}
