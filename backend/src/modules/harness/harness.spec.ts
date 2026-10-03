import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { HarnessService } from './harness.service';
import { INestApplication } from '@nestjs/common';

describe('Suite de Pruebas Automatizadas del Harness (P01 - P12)', () => {
  let app: INestApplication;
  let harnessService: HarnessService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    harnessService = app.get(HarnessService);
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('Debe ejecutar y verificar satisfactoriamente los 12 escenarios de prueba (P01 a P12)', async () => {
    const { summary, results } = await harnessService.runAllTests();

    console.log('\n==================================================');
    console.log(`REPORTE DE EJECUCIÓN DEL HARNESS DE PRUEBAS`);
    console.log(`Total: ${summary.total} | Aprobados: ${summary.passed} | Fallidos: ${summary.failed}`);
    console.log(`Tasa de Éxito: ${summary.successRate}`);
    console.log('==================================================\n');

    results.forEach((r) => {
      const statusIcon = r.status === 'PASSED' ? '✅' : '❌';
      console.log(`${statusIcon} [${r.id}] ${r.scenario} (${r.durationMs}ms)`);
      console.log(`    Detalles: ${r.details}`);
    });

    expect(summary.total).toBe(12);
    expect(summary.failed).toBe(0);
    expect(summary.passed).toBe(12);
  }, 120000);
});
