'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function PortalSolicitantePage() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchFaq, setSearchFaq] = useState('');
  const [misTickets, setMisTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [serviciosN2, setServiciosN2] = useState<any[]>([]);
  const [colas, setColas] = useState<any[]>([]);

  // Formulario nuevo ticket
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    servicioN2Id: '',
    proceso: 'servicios_ti',
    colaId: '',
    prioridad: 'media',
    impacto: 'medio',
    urgencia: 'media',
    sinCiJustificacion: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadFaqs = async () => {
    try {
      setLoadingFaqs(true);
      const data = await api.tickets.getFaqs(searchFaq);
      setFaqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const loadMisTickets = async () => {
    if (!user) return;
    try {
      setLoadingTickets(true);
      const res = await api.tickets.getTickets({ limit: 50 });
      setMisTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadFormData = async () => {
    try {
      const [s2Res, colasRes] = await Promise.all([
        api.catalog.getServices({ limit: 100 }),
        api.queue.getColas(),
      ]);
      setServiciosN2(s2Res.items || []);
      setColas(colasRes || []);
      if (colasRes && colasRes.length > 0) {
        setForm((prev) => ({ ...prev, colaId: String(colasRes[0].id) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, [searchFaq]);

  useEffect(() => {
    loadMisTickets();
    loadFormData();
  }, [user]);

  const handleUtilFaq = async (id: number) => {
    try {
      await api.tickets.marcarUtilFaq(id);
      loadFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.tickets.createTicket({
        titulo: form.titulo,
        descripcion: form.descripcion,
        solicitanteId: user.id,
        servicioN2Id: Number(form.servicioN2Id),
        tipo: 'requisicion_servicio',
        proceso: form.proceso as any,
        colaId: Number(form.colaId),
        prioridad: form.prioridad as any,
        impacto: form.impacto as any,
        urgencia: form.urgencia as any,
        sinCiJustificacion: form.sinCiJustificacion || undefined,
      });

      setSuccessMsg('¡Solicitud enviada exitosamente!');
      setForm({
        titulo: '',
        descripcion: '',
        servicioN2Id: '',
        proceso: 'servicios_ti',
        colaId: colas[0] ? String(colas[0].id) : '',
        prioridad: 'media',
        impacto: 'medio',
        urgencia: 'media',
        sinCiJustificacion: '',
      });
      setShowModalCrear(false);
      loadMisTickets();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Hero Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs tracking-wider uppercase">
                <LifeBuoy className="w-4 h-4" />
                Portal del Solicitante (Autoservicio Nivel 0)
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mt-1">
                Centro de Atención y Servicios de TI
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Consulte soluciones inmediatas en la base de conocimientos o radique una nueva solicitud de servicio.
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowModalCrear(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Nueva Solicitud
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sección 1: Base de Conocimientos / FAQ (L0) */}
        <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Base de Conocimientos y Respuestas Frecuentes
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Encuentre respuestas automáticas antes de abrir un ticket de soporte.
            </p>
            <div className="relative mt-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar guías (ej. correo, wifi, portal, accesos)..."
                value={searchFaq}
                onChange={(e) => setSearchFaq(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-zinc-200/80 rounded-lg p-4 hover:border-indigo-300 transition-all bg-gradient-to-br from-white to-zinc-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                    <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-sans">
                      {faq.categoria}
                    </span>
                    <span>{faq.visitas} consultas</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 mt-1">
                    {faq.titulo}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    {faq.contenido}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    ¿Te resultó útil esta información?
                  </span>
                  <button
                    onClick={() => handleUtilFaq(faq.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded border border-zinc-200 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Útil ({faq.utilCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 2: Mis Solicitudes Radicadas */}
        <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Mis Solicitudes y Tickets Registrados
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Seguimiento en tiempo real de trámites y tickets radicados por usted.
              </p>
            </div>
            <button
              onClick={loadMisTickets}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loadingTickets ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {misTickets.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-200 rounded-lg">
              <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">Aún no tiene solicitudes registradas.</p>
              <button
                onClick={() => setShowModalCrear(true)}
                className="mt-3 text-xs text-indigo-600 font-medium hover:underline"
              >
                Crear su primer ticket ahora
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-medium bg-zinc-50/50">
                    <th className="py-2.5 px-3">Número</th>
                    <th className="py-2.5 px-3">Título</th>
                    <th className="py-2.5 px-3">Proceso</th>
                    <th className="py-2.5 px-3">Servicio</th>
                    <th className="py-2.5 px-3">Cola</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {misTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-indigo-600">
                        {t.numero}
                      </td>
                      <td className="py-3 px-3 font-medium text-zinc-900 max-w-xs truncate">
                        {t.titulo}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 uppercase font-mono text-[10px]">
                        {t.proceso.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 text-zinc-600 max-w-[160px] truncate">
                        {t.servicioN2?.nombre || '-'}
                      </td>
                      <td className="py-3 px-3 text-zinc-600">
                        {t.cola?.nombre || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                            t.estado === 'resuelto' || t.estado === 'cerrado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.estado === 'en_progreso'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : t.estado === 'en_espera'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          {t.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                        {new Date(t.fechaCreacion).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal Crear Solicitud */}
      {showModalCrear && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="text-base font-semibold text-zinc-900">
                Radicar Nueva Solicitud de Servicio
              </h3>
              <button
                onClick={() => setShowModalCrear(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCrearTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Título de la Solicitud *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Solicitud de acceso VPN para docentes"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Servicio del Catálogo de TI *
                </label>
                <select
                  required
                  value={form.servicioN2Id}
                  onChange={(e) => setForm({ ...form, servicioN2Id: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Seleccione un servicio Nivel 2...</option>
                  {serviciosN2.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.codigo} - {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Proceso ITIL *
                  </label>
                  <select
                    value={form.proceso}
                    onChange={(e) => setForm({ ...form, proceso: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="servicios_ti">Servicios de Tecnología</option>
                    <option value="accesos">Gestión de Accesos</option>
                    <option value="incidentes">Reporte de Incidente</option>
                    <option value="cambios">Solicitud de Cambio</option>
                    <option value="nuevos_servicios">Nuevo Servicio</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Cola de Atención *
                  </label>
                  <select
                    value={form.colaId}
                    onChange={(e) => setForm({ ...form, colaId: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {colas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} (N{c.nivelSoporte})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Descripción Detallada *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detalle los requisitos, equipo o justificación de su trámite..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Justificación si no involucra un dispositivo físico (CI)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Solicitud puramente administrativa de permisos lógicos"
                  value={form.sinCiJustificacion}
                  onChange={(e) => setForm({ ...form, sinCiJustificacion: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModalCrear(false)}
                  className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Radicar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
