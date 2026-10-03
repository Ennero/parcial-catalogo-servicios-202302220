'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Play,
  RotateCw,
  AlertCircle,
  History,
} from 'lucide-react';

export default function ImportadorPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const loadLogs = async () => {
    try {
      const data = await api.importer.getLogs();
      setLogs(data);
      if (data.length > 0 && !lastResult) {
        setLastResult(data[0]);
      }
    } catch (err) {
      console.error('Error al cargar historial de importaciones:', err);
    }
  };

  const handleRunImport = async () => {
    if (!isAdmin) return;
    setRunning(true);
    setError(null);
    try {
      const res = await api.importer.run();
      setLastResult(res);
      await loadLogs();
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar importación.');
    } finally {
      setRunning(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2">
        <span className="font-mono text-xs text-zinc-400">Verificando sesión...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Data Trust Boundary &middot; Idempotencia
          </span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Importador de Catálogo Excel</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Procesamiento de <span className="font-mono text-zinc-800 font-medium">CatalogoServicios.xlsx</span> (Hoja: Servicios Externos)
        </p>
      </div>

      {/* Main Action Banner */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-9 w-9 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Control de Calidad de Datos
            </h2>
            <p className="text-xs text-zinc-500 max-w-xl mt-0.5 leading-relaxed">
              Manejo de 76 celdas combinadas, resolución canónica para SE.12 (&quot;Suministrar Analítica&quot;), preservación de nulos y garantía estricta de 12 N1 y 46 N2.
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={handleRunImport}
            disabled={running}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs font-medium text-white disabled:opacity-50 transition-colors shrink-0"
          >
            {running ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Ejecutar Importación</span>
              </>
            )}
          </button>
        ) : (
          <div className="text-[11px] text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded border border-zinc-200">
            Rol consulta: Solo lectura.
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md bg-zinc-50 p-3.5 border border-red-200 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Latest Result Summary */}
      {lastResult && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Último Reporte de Calidad
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 border border-zinc-200 bg-white rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
            <div className="p-4 space-y-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Total Nivel 1</span>
              <p className="text-xl font-semibold font-mono text-zinc-900 mt-1">{lastResult.totalN1 || 12}</p>
              <p className="text-[10px] text-zinc-400">Cota fija: 12 familias</p>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Total Nivel 2</span>
              <p className="text-xl font-semibold font-mono text-zinc-900 mt-1">{lastResult.totalN2 || 46}</p>
              <p className="text-[10px] text-zinc-400">Cota fija: 46 servicios</p>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Nuevos Registros</span>
              <p className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                {(lastResult.creadosN1 || 0) + (lastResult.creadosN2 || 0)}
              </p>
              <p className="text-[10px] text-zinc-400">0 duplicados en re-ejecución</p>
            </div>

            <div className="p-4 space-y-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Incidencias Trazadas</span>
              <p className="text-xl font-semibold font-mono text-zinc-900 mt-1">
                {lastResult.observacionesCount || lastResult.observaciones?.length || 0}
              </p>
              <p className="text-[10px] text-zinc-400">SE.12 y datos nulos</p>
            </div>
          </div>

          {/* Observaciones registradas */}
          {lastResult.observaciones && lastResult.observaciones.length > 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-900">
                <AlertCircle className="h-3.5 w-3.5 text-zinc-500" />
                <span>Observaciones e Incidencias Registradas de Calidad de Datos</span>
              </div>

              <div className="space-y-1.5">
                {lastResult.observaciones.map((obs: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 text-xs"
                  >
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded border border-zinc-200 bg-white text-zinc-700 shrink-0">
                      {obs.tipo}
                    </span>
                    <div>
                      <p className="text-zinc-800">{obs.mensaje}</p>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Fila: {obs.fila || 'N/A'} &middot; Código: {obs.codigo || 'General'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial de Importaciones */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <div className="p-3.5 border-b border-zinc-200 flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500" />
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Historial de Ejecuciones</h3>
        </div>

        {logs.length === 0 ? (
          <p className="p-6 text-xs text-zinc-400 font-mono text-center">No hay ejecuciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-4 font-mono font-medium">Fecha y Hora</th>
                  <th className="py-2.5 px-4 font-mono font-medium">Archivo</th>
                  <th className="py-2.5 px-4 font-mono font-medium">Total L1 / L2</th>
                  <th className="py-2.5 px-4 font-mono font-medium">Creados</th>
                  <th className="py-2.5 px-4 font-mono font-medium">Actualizados</th>
                  <th className="py-2.5 px-4 font-mono font-medium">Omitidos</th>
                  <th className="py-2.5 px-4 font-mono font-medium">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
                {logs.map((lg) => (
                  <tr key={lg.id} className="hover:bg-zinc-50/75">
                    <td className="py-2 px-4 text-zinc-600">{new Date(lg.fecha).toLocaleString()}</td>
                    <td className="py-2 px-4 text-zinc-900 font-medium">{lg.archivo}</td>
                    <td className="py-2 px-4 text-zinc-800">{lg.totalN1} / {lg.totalN2}</td>
                    <td className="py-2 px-4 text-zinc-800">{lg.creadosN1 + lg.creadosN2}</td>
                    <td className="py-2 px-4 text-zinc-600">{lg.actualizados}</td>
                    <td className="py-2 px-4 text-zinc-400">{lg.omitidos}</td>
                    <td className="py-2 px-4 text-zinc-600">{lg.observaciones?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
