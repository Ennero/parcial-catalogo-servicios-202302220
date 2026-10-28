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
  FlaskConical,
} from 'lucide-react';

export default function HarnessPage() {
  const [running, setRunning] = useState(false);
  const [testData, setTestData] = useState<any>({
    lastExecution: null,
    total: 18,
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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-600 font-semibold">
              Harness Engineering &middot; Evaluación Parcial / Tarea CMDB
            </span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            Suite de Pruebas Automatizadas (P01 &ndash; P18)
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Comprobación algorítmica, determinista y observable de los 18 escenarios normativos del enunciado.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={running}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 transition-all shadow-sm shrink-0"
        >
          {running ? (
            <>
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              <span>Ejecutando suite P01-P18...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span>Ejecutar Todas las Pruebas (P01 a P18)</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-50 p-3.5 border border-red-200 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-zinc-200 bg-white rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 shadow-2xs overflow-hidden">
        <div className="p-4 space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Total Escenarios</span>
          <p className="text-2xl font-bold font-mono text-zinc-900 mt-1">{testData.total || 18}</p>
          <p className="text-[10px] text-zinc-400 font-mono">P01 a P18 obligatorios</p>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Aprobados</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600">{testData.passed}</span>
            {testData.passed === 18 && (
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                100% Éxito
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-400">Criterio estricto de aceptación</p>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Fallidos</span>
          <p className="text-2xl font-bold font-mono text-zinc-900 mt-1">{testData.failed}</p>
          <p className="text-[10px] text-zinc-400">0 tolerancia a fallos</p>
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
      <div className="flex items-center gap-3 rounded-lg bg-zinc-900 p-3.5 text-zinc-300 text-xs shadow-2xs">
        <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
        <div className="flex-1 font-mono text-[11px] overflow-x-auto">
          <span className="text-zinc-500"># Ejecución en CLI para evaluación docente:</span>{' '}
          <span className="text-zinc-100 font-bold">./scripts/run_tests.sh</span>{' '}
          <span className="text-zinc-500">o</span>{' '}
          <span className="text-zinc-100 font-bold">docker compose exec backend npm test</span>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/60">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Detalle de Pruebas Automatizadas
          </h3>
          <span className="text-[11px] text-zinc-400 font-mono">18 Casos de Verificación</span>
        </div>

        <div className="divide-y divide-zinc-100">
          {testData.results?.map((r: any) => {
            const isPassed = r.status === 'PASSED';
            const isFailed = r.status === 'FAILED';
            return (
              <div
                key={r.id}
                className="p-4 hover:bg-zinc-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {isPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : isFailed ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-zinc-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600 text-[11px]">{r.id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 uppercase">
                        {r.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-zinc-900 text-xs mt-0.5">{r.scenario}</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{r.details}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 sm:self-center font-mono text-[11px] text-zinc-400">
                  {r.durationMs > 0 ? `${r.durationMs} ms` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
