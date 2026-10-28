import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioN1 } from '../../entities/servicio-n1.entity';
import { ServicioN2 } from '../../entities/servicio-n2.entity';
import { ImportacionObservacion } from '../../entities/importacion-observacion.entity';
import { AuthModule } from '../auth/auth.module';
import { OrganizationModule } from '../organization/organization.module';
import { CatalogModule } from '../catalog/catalog.module';
import { ImporterModule } from '../importer/importer.module';
import { CmdbModule } from '../cmdb/cmdb.module';
import { QueueModule } from '../queue/queue.module';
import { TicketModule } from '../ticket/ticket.module';
import { HarnessService } from './harness.service';
import { HarnessController } from './harness.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicioN1, ServicioN2, ImportacionObservacion]),
    AuthModule,
    OrganizationModule,
    CatalogModule,
    ImporterModule,
    CmdbModule,
    QueueModule,
    TicketModule,
  ],
  controllers: [HarnessController],
  providers: [HarnessService],
  exports: [HarnessService],
})
export class HarnessModule {}
