import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import {
  Empresa,
  Area,
  Departamento,
  Seccion,
  Puesto,
  Usuario,
  ClaseServicio,
  CriticidadServicio,
  TipoServicio,
  ServicioN1,
  ServicioN2,
  ImportacionLog,
  ImportacionObservacion,
  CmdbCategoria,
  CmdbCi,
  CmdbRelacion,
  CmdbCiServicio,
  ColaAtencion,
  ColaUsuario,
  ColaRol,
  Ticket,
  TicketComentario,
  TicketAdjunto,
  TicketBitacora,
  TicketRelacion,
  TicketCi,
  FaqArticulo,
} from './entities';

import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ImporterModule } from './modules/importer/importer.module';
import { HarnessModule } from './modules/harness/harness.module';
import { CmdbModule } from './modules/cmdb/cmdb.module';
import { QueueModule } from './modules/queue/queue.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { runSeeds } from './seeds/seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '3306'), 10),
        username: configService.get<string>('DB_USER', 'catalogouser'),
        password: configService.get<string>('DB_PASSWORD', 'catalogopassword'),
        database: configService.get<string>('DB_NAME', 'catalogodb'),
        entities: [
          Empresa,
          Area,
          Departamento,
          Seccion,
          Puesto,
          Usuario,
          ClaseServicio,
          CriticidadServicio,
          TipoServicio,
          ServicioN1,
          ServicioN2,
          ImportacionLog,
          ImportacionObservacion,
          CmdbCategoria,
          CmdbCi,
          CmdbRelacion,
          CmdbCiServicio,
          ColaAtencion,
          ColaUsuario,
          ColaRol,
          Ticket,
          TicketComentario,
          TicketAdjunto,
          TicketBitacora,
          TicketRelacion,
          TicketCi,
          FaqArticulo,
        ],
        synchronize: true, // Sincronización automática de esquema para ambiente Docker de evaluación
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    OrganizationModule,
    CatalogModule,
    ImporterModule,
    CmdbModule,
    QueueModule,
    TicketModule,
    HarnessModule,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      const userCount = await this.dataSource.getRepository(Usuario).count();
      if (userCount === 0) {
        console.log('Base de datos vacía detectada. Ejecutando seed automático de inicio...');
        await runSeeds(this.dataSource);
      }
    } catch (err) {
      console.warn('Error o aviso durante verificación de seed inicial:', err);
    }
  }
}
