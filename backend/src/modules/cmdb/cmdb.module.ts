import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmdbController } from './cmdb.controller';
import { CmdbService } from './cmdb.service';
import {
  CmdbCategoria,
  CmdbCi,
  CmdbRelacion,
  CmdbCiServicio,
  Usuario,
  ServicioN2,
  ServicioN1,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CmdbCategoria,
      CmdbCi,
      CmdbRelacion,
      CmdbCiServicio,
      Usuario,
      ServicioN2,
      ServicioN1,
    ]),
  ],
  controllers: [CmdbController],
  providers: [CmdbService],
  exports: [CmdbService],
})
export class CmdbModule {}
