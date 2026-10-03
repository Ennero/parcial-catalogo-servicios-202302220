import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ImporterService } from '../modules/importer/importer.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importerService = app.get(ImporterService);
  const customPath = process.argv[2];
  try {
    const result = await importerService.importCatalogFromExcel(customPath);
    console.log('--- REPORTE DE IMPORTACIÓN ---');
    console.log(`Archivo: ${result.archivo}`);
    console.log(`Nivel 1 Creados: ${result.creadosN1}, Total: ${result.totalN1}`);
    console.log(`Nivel 2 Creados: ${result.creadosN2}, Total: ${result.totalN2}`);
    console.log(`Actualizados: ${result.actualizados}, Omitidos: ${result.omitidos}`);
    console.log(`Observaciones registradas: ${result.observacionesCount}`);
    result.observaciones.forEach((obs) => {
      console.log(`  [${obs.tipo}] Fila ${obs.fila || 'N/A'}: ${obs.mensaje}`);
    });
  } catch (err) {
    console.error('Error al importar catálogo:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
