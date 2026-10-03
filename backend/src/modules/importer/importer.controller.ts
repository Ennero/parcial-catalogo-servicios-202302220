import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import { ImporterService } from './importer.service';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../entities/usuario.entity';

@Controller('api/catalog/import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImporterController {
  constructor(private readonly importerService: ImporterService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  async runImport(@Body() body?: { filePath?: string }) {
    return this.importerService.importCatalogFromExcel(body?.filePath);
  }

  @Get('logs')
  async getLogs() {
    return this.importerService.getImportLogs();
  }
}
