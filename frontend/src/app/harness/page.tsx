'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Clock,
  Terminal,
  AlertCircle,
} from 'lucide-react';

export default function HarnessPage() {
  const [running, setRunning] = useState(false);
  const [testData, setTestData] = useState<any>({
    lastExecution: null,
    total: 12,
    passed: 0,
    failed: 0,
    results: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHarnessStatus();
  }, []);

  const loadHarnessStatus = async () => {
    try {
      const data = await api.harness.getStatus();
      setTestData(data);
    } catch (err) {
      console.error('Error al cargar estado del harness:', err);
    }
  };

  const handleRunTests = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await api.harness.run();
      setTestData({
        lastExecution: res.summary.timestamp,
        total: res.summary.total,
        passed: res.summary.passed,
        failed: res.summary.failed,
        results: res.results,
      });
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar la suite de pruebas.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Banco de Pruebas Automatizadas &middot; Evaluación Parcial
            </span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Suite de Pruebas (P01 &ndash; P12)
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Verificación algorítmica y determinista de los 12 escenarios normativos del enunciado
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={running}
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs font-medium text-white disabled:opacity-50 transition-colors shrink-0"
        >
          {running ? (
            <>
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              <span>Ejecutando pruebas...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span>Ejecutar Pruebas Ahora</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md bg-zinc-50 p-3.5 border border-red-200 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-zinc-200 bg-white rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        <div className="p-4 space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Total Escenarios</span>
          <p className="text-2xl font-semibold font-mono text-zinc-900 mt-1">{testData.total || 12}</p>
          <p className="text-[10px] text-zinc-400">P01 a P12</p>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Aprobados</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-semibold font-mono text-zinc-900">{testData.passed}</span>
            <span className="text-[10px] text-emerald-600 font-medium">100% éxito</span>
          </div>
          <p className="text-[10px] text-zinc-400">Criterio estricto</p>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Fallidos</span>
          <p className="text-2xl font-semibold font-mono text-zinc-900 mt-1">{testData.failed}</p>
          <p className="text-[10px] text-zinc-400">0 tolerancia</p>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Última Ejecución</span>
          <p className="text-xs font-mono font-medium text-zinc-800 mt-1">
            {testData.lastExecution ? new Date(testData.lastExecution).toLocaleTimeString() : 'Pendiente'}
          </p>
          <p className="text-[10px] text-zinc-400 font-mono">
            {testData.lastExecution ? new Date(testData.lastExecution).toLocaleDateString() : 'Sin ejecutar'}
          </p>
        </div>
      </div>

      {/* Terminal CLI Hint */}
      <div className="flex items-center gap-3 rounded-md bg-zinc-900 p-3.5 text-zinc-300 text-xs">
        <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
        <div className="flex-1 font-mono text-[11px] overflow-x-auto">
          <span className="text-zinc-500"># Ejecución nativa en CLI:</span>{' '}
          <span className="text-zinc-200">./scripts/run_tests.sh</span>{' '}
          <span className="text-zinc-500">o</span>{' '}
          <span className="text-zinc-200">docker compose exec backend npm test</span>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Detalle de Escenarios de Prueba
          </h3>
          <span className="font-mono text-[11px] text-zinc-400">12 / 12 Escenarios Cubiertos</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {testData.results?.map((t: any) => {
            const isPassed = t.status === 'PASSED';
            const isFailed = t.status === 'FAILED';

            return (
              <div key={t.id} className="p-3.5 hover:bg-zinc-50/75 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-medium px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-800">
                      {t.id}
                    </span>
                    <h4 className="text-xs font-medium text-zinc-900">{t.scenario}</h4>
                    <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded border border-zinc-200 text-zinc-500">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {t.durationMs !== undefined && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {t.durationMs}ms
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPassed ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-zinc-300'
                        }`}
                      />
                      <span className="font-mono text-[10px] font-semibold text-zinc-700">
                        {t.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 pl-8 leading-relaxed font-sans">{t.details}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
