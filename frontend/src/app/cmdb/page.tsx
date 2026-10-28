'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Server,
  Network,
  Cpu,
  Layers,
  Search,
  Filter,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Database,
  ExternalLink,
  GitFork,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function CmdbPage() {
  const { user, isAdmin } = useAuth();
  const [cis, setCis] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [duracionMs, setDuracionMs] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterUbicacion, setFilterUbicacion] = useState('');
  const [categorias, setCategorias] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState('');

  // CI Seleccionado para Ficha Técnica
  const [selectedCi, setSelectedCi] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Análisis de Impacto (Grafo)
  const [impactData, setImpactData] = useState<any>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);

  // Generador Sintético
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');

  const loadCategorias = async () => {
    try {
      const data = await api.cmdb.getCategorias();
      setCategorias(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCis = async () => {
    try {
      setLoading(true);
      const res = await api.cmdb.getCis({
        page,
        limit,
        search,
        categoriaId: selectedCatId ? Number(selectedCatId) : undefined,
        estado: filterEstado || undefined,
        ubicacion: filterUbicacion || undefined,
      });
      setCis(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setDuracionMs(res.duracionMs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCiDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const data = await api.cmdb.getCiById(id);
      setSelectedCi(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRunImpactAnalysis = async (ciId: number) => {
    try {
      setLoadingImpact(true);
      const data = await api.cmdb.getImpactedServices(ciId);
      setImpactData(data);
      setShowImpactModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingImpact(false);
    }
  };

  const handleGenerarSinteticos = async () => {
    try {
      setGenerating(true);
      setGenMessage('Generando dispositivos sintéticos...');
      const res = await api.cmdb.generarSinteticos({ cantidad: 5000, semilla: 202302220 });
      setGenMessage(`¡Éxito! Total: ${res.totalDispositivos} CIs en la base de datos.`);
      loadCis();
    } catch (err: any) {
      setGenMessage(`Error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    loadCis();
  }, [page, limit, search, selectedCatId, filterEstado, filterUbicacion]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs tracking-wider uppercase">
                <Server className="w-4 h-4" />
                Base de Datos de Gestión de la Configuración (CMDB)
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mt-1">
                Elementos de Configuración (CIs) & Grafo de Dependencias
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Mantenimiento de {total.toLocaleString()} dispositivos físicos, lógicos y virtuales con análisis de impacto.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={handleGenerarSinteticos}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generating ? 'Cargando...' : 'Generador 5,000 CI'}
                </button>
              )}
              <button
                onClick={loadCis}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refrescar
              </button>
            </div>
          </div>

          {genMessage && (
            <div className="mt-3 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-700">
              {genMessage}
            </div>
          )}

          {/* Estadísticas de Rendimiento (P16) */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/80">
            <div>
              Total CIs Persistidos: <span className="font-semibold text-zinc-900">{total.toLocaleString()}</span>
            </div>
            <div className="h-3 w-[1px] bg-zinc-300" />
            <div>
              Tiempo de Consulta: <span className="font-semibold text-emerald-600">{duracionMs} ms</span>
            </div>
            <div className="h-3 w-[1px] bg-zinc-300" />
            <div>
              Página: <span className="font-semibold text-zinc-900">{page}</span> de {totalPages}
            </div>
            <div className="h-3 w-[1px] bg-zinc-300" />
            <div>
              Taxonomía: <span className="font-semibold text-zinc-900">ITIL v4 (3 Niveles)</span>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-zinc-500 font-medium mb-1">Buscar por código, nombre o IP</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="CI-SRV-..., 10.14..., Dell..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-zinc-200 rounded-md bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Categoría / Clase</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md bg-white focus:outline-none"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {'—'.repeat(c.nivel - 1)} {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md bg-white focus:outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="operativo">Operativo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="en_almacen">En Almacén</option>
                <option value="falla">Falla</option>
                <option value="retirado">Retirado</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Ubicación</label>
              <input
                type="text"
                placeholder="Datacenter, Edificio T3..."
                value={filterUbicacion}
                onChange={(e) => setFilterUbicacion(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-md bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Grid de CIs y Ficha Técnica */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tabla Paginada de CIs (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden flex flex-col h-[750px]">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-medium bg-zinc-50/70">
                    <th className="py-2.5 px-3 font-mono">Código (Tag)</th>
                    <th className="py-2.5 px-3">Nombre</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">IP / Red</th>
                    <th className="py-2.5 px-3">Ubicación</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {cis.map((ci) => {
                    const isSelected = selectedCi?.id === ci.id;
                    return (
                      <tr
                        key={ci.id}
                        onClick={() => loadCiDetail(ci.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-50/70' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-medium text-indigo-600">
                          {ci.codigo}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-zinc-900 max-w-[180px] truncate">
                          {ci.nombre}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-500 text-[11px]">
                          {ci.categoria?.nombre || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600">
                          {ci.tieneIp && ci.ip ? ci.ip : <span className="text-zinc-300">N/A</span>}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-500 text-[11px] max-w-[140px] truncate">
                          {ci.ubicacion}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                              ci.estado === 'operativo'
                                ? 'bg-emerald-50 text-emerald-700'
                                : ci.estado === 'mantenimiento'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {ci.estado}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunImpactAnalysis(ci.id);
                            }}
                            className="px-2 py-0.5 text-[10px] bg-zinc-100 hover:bg-indigo-50 text-indigo-700 border border-zinc-200 rounded font-medium"
                            title="Calcular grafo de impacto en servicios"
                          >
                            Impacto
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="p-3 border-t border-zinc-200 bg-zinc-50/60 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2.5 py-1 border border-zinc-200 rounded bg-white disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="font-mono text-zinc-700">{page}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-2.5 py-1 border border-zinc-200 rounded bg-white disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          {/* Ficha Técnica de CI Seleccionado (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-zinc-200 shadow-2xs p-5 h-[750px] overflow-y-auto">
            {!selectedCi ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400">
                <Server className="w-10 h-10 text-zinc-200 mb-2" />
                <p className="text-xs font-medium text-zinc-500">
                  Haga clic en un CI para ver sus especificaciones técnicas y servicios asociados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="pb-3 border-b border-zinc-200">
                  <span className="font-mono text-xs font-semibold text-indigo-600 block">
                    {selectedCi.codigo}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 mt-0.5">
                    {selectedCi.nombre}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {selectedCi.categoria?.nombre}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRunImpactAnalysis(selectedCi.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-2xs"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    Análisis de Impacto en Servicios
                  </button>
                </div>

                {/* Especificaciones Técnicas */}
                <div className="space-y-2 text-xs bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <span className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                    Ficha Técnica
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Fabricante</span>
                      <span className="font-medium text-zinc-800">{selectedCi.fabricante || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Modelo</span>
                      <span className="font-medium text-zinc-800">{selectedCi.modelo || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Número de Serie</span>
                      <span className="font-mono text-zinc-800">{selectedCi.numeroSerie || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Dirección IP</span>
                      <span className="font-mono text-zinc-800">{selectedCi.tieneIp ? selectedCi.ip : 'Sin IP (N/A)'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-400 block text-[10px]">Ubicación Física / Nube</span>
                      <span className="font-medium text-zinc-800">{selectedCi.ubicacion}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-400 block text-[10px]">Responsable Técnico</span>
                      <span className="font-medium text-zinc-800">{selectedCi.responsable?.nombre || 'Sin asignar'}</span>
                    </div>
                  </div>
                </div>

                {/* Servicios de TI Vinculados */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 text-xs">
                  <span className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                    Servicios de TI Soportados ({selectedCi.serviciosAsociados?.length || 0})
                  </span>
                  {selectedCi.serviciosAsociados?.length === 0 ? (
                    <p className="text-[11px] text-zinc-400 italic">No tiene servicios asignados directamente.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedCi.serviciosAsociados?.map((s: any, idx: number) => (
                        <div key={idx} className="p-2 bg-indigo-50/50 border border-indigo-100 rounded text-[11px]">
                          <span className="font-semibold text-indigo-900 block">{s.servicioN2.nombre}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            N1: {s.servicioN1?.nombre} | Rol: {s.rolEnServicio}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Relaciones Técnicas */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 text-xs">
                  <span className="font-semibold text-zinc-900 block text-[11px] uppercase tracking-wider">
                    Relaciones Técnicas en Grafo
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <div className="text-zinc-500 font-medium">Salientes (Depende de / Conectado a):</div>
                    {selectedCi.relacionesSalientes?.length === 0 ? (
                      <span className="text-zinc-400 italic block">Ninguna</span>
                    ) : (
                      selectedCi.relacionesSalientes?.map((r: any) => (
                        <div key={r.id} className="pl-2 border-l-2 border-indigo-300 py-0.5">
                          <span className="font-mono text-indigo-700 text-[10px]">{r.tipoRelacion}</span> →{' '}
                          <span className="font-medium">{r.destino?.nombre}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Análisis de Impacto en Grafo (Graph Engineering) */}
      {showImpactModal && impactData && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-zinc-900">
                  Recorrido de Grafo: Análisis de Impacto en Servicios TI
                </h3>
              </div>
              <button onClick={() => setShowImpactModal(false)} className="text-zinc-400 hover:text-zinc-600">
                ✕
              </button>
            </div>

            {/* Disclaimer Formal de ITIL (P14) */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p className="leading-relaxed">
                <strong>Aviso de Gobernanza ITIL:</strong> {impactData.disclaimer}
              </p>
            </div>

            {/* Dispositivo Raíz Consultado */}
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">CI Origen Evaluado</span>
              <h4 className="font-bold text-zinc-900 text-sm mt-0.5">
                {impactData.ciConsultado.codigo} — {impactData.ciConsultado.nombre}
              </h4>
            </div>

            {/* Cadena de Dependencias Técnicas Recorridas */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-zinc-900 block">
                Cadena de Dependencias Técnicas (Transitive Closure): {impactData.totalCisEnCadena} CI(s)
              </span>
              <div className="max-h-36 overflow-y-auto border border-zinc-200 rounded-lg divide-y divide-zinc-100 text-[11px]">
                {impactData.cadenaDependencias.map((c: any) => (
                  <div key={c.id} className="p-2 flex items-center justify-between">
                    <span className="font-medium text-zinc-800">{c.codigo} - {c.nombre}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">Profundidad: {c.profundidad}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Servicios Potencialmente Afectados */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-zinc-900 block">
                Servicios del Catálogo Potencialmente Afectados: {impactData.totalServiciosN2Afectados} Nivel 2 | {impactData.totalServiciosN1Afectados} Nivel 1
              </span>
              {impactData.serviciosPotencialmenteAfectadosN2.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No se identificaron servicios asociados a esta cadena.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {impactData.serviciosPotencialmenteAfectadosN2.map((s: any) => (
                    <div key={s.id} className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-lg">
                      <span className="font-bold text-indigo-950 block">{s.codigo} - {s.nombre}</span>
                      <span className="text-zinc-500 text-[10px] block mt-0.5">
                        N1: {s.servicioN1.codigo} - {s.servicioN1.nombre}
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        Criticidad: {s.criticidad}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-100">
              <button
                onClick={() => setShowImpactModal(false)}
                className="px-4 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium"
              >
                Cerrar Análisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
