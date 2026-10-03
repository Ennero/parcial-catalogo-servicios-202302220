import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../../entities/empresa.entity';
import { Area } from '../../entities/area.entity';
import { Departamento } from '../../entities/departamento.entity';
import { Seccion } from '../../entities/seccion.entity';
import { Puesto } from '../../entities/puesto.entity';
import { Usuario } from '../../entities/usuario.entity';
import { ServicioN2 } from '../../entities/servicio-n2.entity';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empresa,
      Area,
      Departamento,
      Seccion,
      Puesto,
      Usuario,
      ServicioN2,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
