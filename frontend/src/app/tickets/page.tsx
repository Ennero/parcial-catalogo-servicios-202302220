'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket,
  Filter,
  Search,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  RotateCcw,
  MessageSquare,
  History,
  FileCheck,
  AlertTriangle,
  Send,
  Lock,
  Server,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export default function TicketsConsolePage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [colas, setColas] = useState<any[]>([]);

  // Filtros
  const [filterProceso, setFilterProceso] = useState('');
  const [filterCola, setFilterCola] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState('');
  const [search, setSearch] = useState('');

  // Ticket seleccionado para vista detalle
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Estados de modales y acciones
  const [showModalEstado, setShowModalEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('en_progreso');
  const [solucionAplicada, setSolucionAplicada] = useState('');
  const [motivoEstado, setMotivoEstado] = useState('');

  const [showModalTransferir, setShowModalTransferir] = useState(false);
  const [nuevaColaId, setNuevaColaId] = useState('');
  const [motivoTransferencia, setMotivoTransferencia] = useState('');

  const [showModalReabrir, setShowModalReabrir] = useState(false);
  const [motivoReapertura, setMotivoReapertura] = useState('');

  // Comentario
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [esNotaInterna, setEsNotaInterna] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadColas = async () => {
    try {
      const data = await api.queue.getColas();
      setColas(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.tickets.getTickets({
        page,
        limit: 25,
        search,
        proceso: filterProceso || undefined,
        colaId: filterCola ? Number(filterCola) : undefined,
        estado: filterEstado || undefined,
        prioridad: filterPrioridad || undefined,
      });
      setTickets(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const data = await api.tickets.getTicketById(id);
      setSelectedTicket(data);
      setActionMsg(null);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadColas();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [page, search, filterProceso, filterCola, filterEstado, filterPrioridad]);

  // Acción 1: Tomar ticket concurrentemente (P07)
  const handleTomarTicket = async (ticketId: number) => {
    try {
      await api.tickets.tomarTicket(ticketId);
      setActionMsg({ type: 'success', text: '¡Ticket asignado exitosamente a su usuario!' });
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        loadTicketDetail(ticketId);
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Error al reclamar ticket' });
    }
  };

  // Acción 2: Cambiar estado (P09, P10, P15)
  const handleCambiarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await api.tickets.cambiarEstado(selectedTicket.id, {
        nuevoEstado: nuevoEstado as any,
        motivo: motivoEstado,
        solucionAplicada: solucionAplicada || undefined,
      });
      setShowModalEstado(false);
      setSolucionAplicada('');
      setMotivoEstado('');
      setActionMsg({ type: 'success', text: `Estado actualizado a "${nuevoEstado}".` });
      loadTickets();
      loadTicketDetail(selectedTicket.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Acción 3: Transferir entre colas (P08)
  const handleTransferir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !nuevaColaId) return;
    try {
      await api.tickets.transferirTicket(selectedTicket.id, {
        nuevaColaId: Number(nuevaColaId),
        motivo: motivoTransferencia,
      });
      setShowModalTransferir(false);
      setMotivoTransferencia('');
      setActionMsg({ type: 'success', text: 'Ticket transferido exitosamente de cola.' });
      loadTickets();
      loadTicketDetail(selectedTicket.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Acción 4: Reabrir ticket (P15)
  const handleReabrir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await api.tickets.reabrirTicket(selectedTicket.id, {
        motivo: motivoReapertura,
      });
      setShowModalReabrir(false);
      setMotivoReapertura('');
      setActionMsg({ type: 'success', text: 'Ticket reabierto exitosamente.' });
      loadTickets();
      loadTicketDetail(selectedTicket.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Acción 5: Agregar comentario
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !nuevoComentario.trim()) return;
    setSubmittingComment(true);
    try {
      await api.tickets.addComentario(selectedTicket.id, {
        contenido: nuevoComentario,
        esNotaInterna,
      });
      setNuevoComentario('');
      loadTicketDetail(selectedTicket.id);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs tracking-wider uppercase">
                <Ticket className="w-4 h-4" />
                Consola de Atención y Mesa de Ayuda
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mt-1">
                Gestión Integral de Tickets & 7 Procesos ITIL
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Flujos de Nuevos Servicios, Cambios, Incidentes (I0-I6), Eventos (E0-E3), Problemas, Accesos y Servicios TI.
              </p>
            </div>
            <button
              onClick={loadTickets}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors shadow-2xs self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </div>

          {/* Filtros de Selección Rápida */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-zinc-500 font-medium mb-1">Buscar por texto/número</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="TK-2026-..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-zinc-200 rounded-md bg-zinc-50/50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Proceso ITIL</label>
              <select
                value={filterProceso}
                onChange={(e) => setFilterProceso(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md bg-zinc-50/50 focus:bg-white focus:outline-none"
              >
                <option value="">Todos los 7 procesos</option>
                <option value="nuevos_servicios">Nuevos Servicios</option>
                <option value="cambios">Gestión de Cambios</option>
                <option value="incidentes">Incidentes (I0-I6)</option>
                <option value="eventos">Eventos (E0-E3)</option>
                <option value="problemas">Problemas & KEDB</option>
                <option value="accesos">Gestión de Accesos</option>
                <option value="servicios_ti">Servicios TI</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Cola de Atención</label>
              <select
                value={filterCola}
                onChange={(e) => setFilterCola(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md bg-zinc-50/50 focus:bg-white focus:outline-none"
              >
                <option value="">Todas las colas</option>
                {colas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md bg-zinc-50/50 focus:bg-white focus:outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="nuevo">Nuevo</option>
                <option value="asignado">Asignado</option>
                <option value="en_progreso">En Progreso</option>
                <option value="en_espera">En Espera (Pausa)</option>
                <option value="aprobado">Aprobado</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Prioridad</label>
              <select
                value={filterPrioridad}
                onChange={(e) => setFilterPrioridad(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-md bg-zinc-50/50 focus:bg-white focus:outline-none"
              >
                <option value="">Todas las prioridades</option>
                <option value="muy_alta">Muy Alta</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="font-bold">✕</button>
          </div>
        </div>
      )}

      {/* Main Grid: Lista de Tickets + Detalle Completo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Tabla / Lista de Tickets (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden flex flex-col h-[750px]">
            <div className="p-3.5 border-b border-zinc-200 bg-zinc-50/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700">
                Tickets ({total})
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Página {page}</span>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-zinc-100">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No se encontraron tickets con los filtros indicados.
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => loadTicketDetail(t.id)}
                      className={`p-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/60 border-l-4 border-l-indigo-600'
                          : 'hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                        <span className="font-semibold text-indigo-600">{t.numero}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-medium uppercase ${
                            t.prioridad === 'muy_alta' || t.prioridad === 'alta'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {t.prioridad}
                        </span>
                      </div>
                      <h4 className="text-xs font-medium text-zinc-900 truncate">
                        {t.titulo}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2">
                        <span className="capitalize text-zinc-600">
                          {t.proceso.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-[10px]">
                          {t.responsable ? t.responsable.nombre.split(' ')[0] : 'Sin asignar'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
                            t.estado === 'resuelto' || t.estado === 'cerrado'
                              ? 'bg-emerald-50 text-emerald-700'
                              : t.estado === 'en_progreso'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          {t.estado.replace('_', ' ')}
                        </span>
                        {!t.responsableId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTomarTicket(t.id);
                            }}
                            className="px-2 py-0.5 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium shadow-2xs"
                          >
                            Tomar Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Ficha de Detalle del Ticket (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 shadow-2xs p-6 h-[750px] overflow-y-auto">
            {!selectedTicket ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400">
                <Ticket className="w-12 h-12 text-zinc-200 mb-2" />
                <p className="text-sm font-medium text-zinc-500">
                  Seleccione un ticket para visualizar su ficha y trazabilidad
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Podrá cambiar estados, transferir entre colas, añadir notas y auditar la bitácora.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cabecera del Detalle */}
                <div className="pb-4 border-b border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-indigo-600">
                      {selectedTicket.numero}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-zinc-100 text-zinc-700">
                        {selectedTicket.tipo.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                          selectedTicket.estado === 'resuelto' || selectedTicket.estado === 'cerrado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedTicket.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 mt-1">
                    {selectedTicket.titulo}
                  </h2>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                    {selectedTicket.descripcion}
                  </p>
                </div>

                {/* Acciones Rápidas de Agente */}
                <div className="flex flex-wrap items-center gap-2">
                  {!selectedTicket.responsableId && (
                    <button
                      onClick={() => handleTomarTicket(selectedTicket.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-2xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Tomar Ticket
                    </button>
                  )}

                  <button
                    onClick={() => setShowModalEstado(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Cambiar Estado
                  </button>

                  <button
                    onClick={() => setShowModalTransferir(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-md text-xs font-medium"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Transferir Cola
                  </button>

                  {(selectedTicket.estado === 'resuelto' || selectedTicket.estado === 'cerrado') && (
                    <button
                      onClick={() => setShowModalReabrir(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md text-xs font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reabrir
                    </button>
                  )}
                </div>

                {/* Grid de Metadatos de Negocio & RACI */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50/70 p-3 rounded-lg border border-zinc-200/80">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-mono">Solicitante</span>
                    <span className="font-medium text-zinc-900">
                      {selectedTicket.solicitante?.nombre || 'Anónimo'} ({selectedTicket.solicitante?.email})
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-mono">Responsable (Agente)</span>
                    <span className="font-medium text-zinc-900">
                      {selectedTicket.responsable?.nombre || 'Sin Asignar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-mono">Servicio N2 & N1</span>
                    <span className="font-medium text-zinc-900">
                      {selectedTicket.servicioN2?.codigo} - {selectedTicket.servicioN2?.nombre}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">
                      (N1 Derivado: {selectedTicket.servicioN1?.nombre})
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-mono">Cola & Proceso</span>
                    <span className="font-medium text-zinc-900">
                      {selectedTicket.cola?.nombre}
                    </span>
                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">
                      {selectedTicket.proceso}
                    </span>
                  </div>
                </div>

                {/* Parámetros Específicos del Proceso (Metadata) */}
                {selectedTicket.metadataParsed && (
                  <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg text-xs">
                    <span className="font-semibold text-indigo-900 block mb-1">
                      Parámetros de Gobernanza ITIL ({selectedTicket.proceso.replace('_', ' ')})
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-700">
                      {Object.entries(selectedTicket.metadataParsed).map(([key, val]) => (
                        <div key={key}>
                          <span className="font-mono text-zinc-400 text-[10px] capitalize">{key}: </span>
                          <span className="font-medium">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solución Aplicada */}
                {selectedTicket.solucionAplicada && (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg text-xs">
                    <span className="font-semibold text-emerald-900 block mb-1">
                      Solución Técnica / Administrativa Aplicada
                    </span>
                    <p className="text-emerald-800">{selectedTicket.solucionAplicada}</p>
                  </div>
                )}

                {/* Sección Comentarios & Notas Internas */}
                <div className="space-y-3 pt-2 border-t border-zinc-200">
                  <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                    Comentarios y Notas de Trabajo ({selectedTicket.comentarios?.length || 0})
                  </h3>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {selectedTicket.comentarios?.map((c: any) => (
                      <div
                        key={c.id}
                        className={`p-2.5 rounded-lg text-xs border ${
                          c.esNotaInterna
                            ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                          <span className="font-semibold">
                            {c.autor?.nombre} {c.esNotaInterna && '🔒 [Nota Interna]'}
                          </span>
                          <span className="text-zinc-400">
                            {new Date(c.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="leading-relaxed">{c.contenido}</p>
                      </div>
                    ))}
                  </div>

                  {/* Formulario nuevo comentario */}
                  <form onSubmit={handleAddComment} className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-zinc-600">
                        Añadir comentario o nota
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={esNotaInterna}
                          onChange={(e) => setEsNotaInterna(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span>Nota Interna (Confidencial)</span>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={esNotaInterna ? "Escriba una nota interna..." : "Escriba un comentario visible..."}
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-md text-xs focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sección Bitácora Inmutable de Auditoría */}
                <div className="space-y-2 pt-3 border-t border-zinc-200">
                  <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-zinc-400" />
                    Bitácora Inmutable de Auditoría (Trazabilidad)
                  </h3>
                  <div className="border border-zinc-200 rounded-lg max-h-36 overflow-y-auto text-[11px] divide-y divide-zinc-100">
                    {selectedTicket.bitacora?.map((b: any) => (
                      <div key={b.id} className="p-2 flex items-start justify-between">
                        <div>
                          <span className="font-mono font-medium text-zinc-700">{b.accion}</span>
                          <span className="text-zinc-500 ml-2">por {b.actorNombre}</span>
                          {b.motivo && <p className="text-zinc-400 text-[10px] italic mt-0.5">{b.motivo}</p>}
                        </div>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {new Date(b.fecha).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Cambiar Estado */}
      {showModalEstado && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Transición de Estado ({selectedTicket?.numero})
            </h3>
            <form onSubmit={handleCambiarEstado} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Nuevo Estado *</label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-md"
                >
                  <option value="en_progreso">En Progreso</option>
                  <option value="en_espera">En Espera (Pausa de SLA)</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>

              {(nuevoEstado === 'resuelto' || nuevoEstado === 'cerrado') && (
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">
                    Solución Aplicada * (Obligatoria para resolver/cerrar)
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detalle la solución técnica aplicada..."
                    value={solucionAplicada}
                    onChange={(e) => setSolucionAplicada(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 rounded-md"
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Motivo de Transición</label>
                <input
                  type="text"
                  placeholder="Justificación del cambio de estado..."
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModalEstado(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded-md font-medium"
                >
                  Confirmar Transición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transferir Cola */}
      {showModalTransferir && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Transferencia de Cola ({selectedTicket?.numero})
            </h3>
            <form onSubmit={handleTransferir} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Cola Destino *</label>
                <select
                  required
                  value={nuevaColaId}
                  onChange={(e) => setNuevaColaId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-md"
                >
                  <option value="">Seleccione una cola...</option>
                  {colas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.proceso})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Motivo Obligatorio *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Razón por la cual se transfiere a otra cola..."
                  value={motivoTransferencia}
                  onChange={(e) => setMotivoTransferencia(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModalTransferir(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-md font-medium"
                >
                  Transferir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reabrir */}
      {showModalReabrir && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900">
              Reapertura Controlada ({selectedTicket?.numero})
            </h3>
            <form onSubmit={handleReabrir} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">
                  Motivo Formal de Reapertura *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Indique por qué se reabre el ticket resuelto..."
                  value={motivoReapertura}
                  onChange={(e) => setMotivoReapertura(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModalReabrir(false)}
                  className="px-3 py-1.5 border border-zinc-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-md font-medium"
                >
                  Reabrir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
