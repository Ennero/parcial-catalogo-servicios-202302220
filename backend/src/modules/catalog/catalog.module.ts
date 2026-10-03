import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioN1 } from '../../entities/servicio-n1.entity';
import { ServicioN2 } from '../../entities/servicio-n2.entity';
import { ClaseServicio } from '../../entities/clase-servicio.entity';
import { CriticidadServicio } from '../../entities/criticidad-servicio.entity';
import { TipoServicio } from '../../entities/tipo-servicio.entity';
import { Seccion } from '../../entities/seccion.entity';
import { Usuario } from '../../entities/usuario.entity';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServicioN1,
      ServicioN2,
      ClaseServicio,
      CriticidadServicio,
      TipoServicio,
      Seccion,
      Usuario,
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
