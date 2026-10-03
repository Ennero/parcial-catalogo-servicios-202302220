import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { runSeeds } from '../seeds/seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  try {
    await runSeeds(dataSource);
    console.log('Seed ejecutado satisfactoriamente.');
  } catch (err) {
    console.error('Error al ejecutar seed:', err);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
