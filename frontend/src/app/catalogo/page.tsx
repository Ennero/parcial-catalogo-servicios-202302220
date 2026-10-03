'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export default function CatalogoPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedN1, setSelectedN1] = useState('');
  const [selectedClase, setSelectedClase] = useState('');
  const [selectedCrit, setSelectedCrit] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedActivo, setSelectedActivo] = useState('');

  // Catálogos para selects
  const [n1List, setN1List] = useState<any[]>([]);
  const [clases, setClases] = useState<any[]>([]);
  const [criticidades, setCriticidades] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Modal Ficha Técnica
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [showFicha, setShowFicha] = useState(false);

  // Modal Crear/Editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    servicioN1Id: '',
    claseId: '',
    criticidadId: '',
    tipoId: '',
    estadoActivo: 'S',
    descripcion: '',
    metrica: '',
    minimo: '',
    maximo: '',
    seccionResponsableId: '',
    usuarioResponsableId: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadCatalogs();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user, page, search, selectedN1, selectedClase, selectedCrit, selectedTipo, selectedActivo]);

  const loadCatalogs = async () => {
    try {
      const [n1, cl, cr, tp, sec, usr] = await Promise.all([
        api.catalog.getN1().catch(() => []),
        api.catalog.getClases().catch(() => []),
        api.catalog.getCriticidades().catch(() => []),
        api.catalog.getTipos().catch(() => []),
        api.organization.getSecciones().catch(() => []),
        api.organization.getUsuarios().catch(() => []),
      ]);
      setN1List(n1);
      setClases(cl);
      setCriticidades(cr);
      setTipos(tp);
      setSecciones(sec);
      setUsuarios(usr);
    } catch (err) {
      console.error('Error cargando catálogos auxiliares:', err);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.catalog.getServices({
        page,
        limit: 15,
        search: search.trim() || undefined,
        servicioN1Id: selectedN1 || undefined,
        claseId: selectedClase || undefined,
        criticidadId: selectedCrit || undefined,
        tipoId: selectedTipo || undefined,
        activo: selectedActivo !== '' ? selectedActivo : undefined,
      });
      setServices(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error cargando servicios:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFicha = async (service: any) => {
    try {
      const detailed = await api.catalog.getServiceById(service.id);
      setSelectedService(detailed);
      setShowFicha(true);
    } catch (err) {
      setSelectedService(service);
      setShowFicha(true);
    }
  };

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setFormData({
      codigo: '',
      nombre: '',
      servicioN1Id: n1List[0]?.id ? String(n1List[0].id) : '',
      claseId: '',
      criticidadId: '',
      tipoId: '',
      estadoActivo: 'S',
      descripcion: '',
      metrica: '',
      minimo: '',
      maximo: '',
      seccionResponsableId: '',
      usuarioResponsableId: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (srv: any) => {
    setEditingServiceId(srv.id);
    setFormData({
      codigo: srv.codigo,
      nombre: srv.nombre,
      servicioN1Id: String(srv.servicioN1Id || ''),
      claseId: String(srv.claseId || ''),
      criticidadId: String(srv.criticidadId || ''),
      tipoId: String(srv.tipoId || ''),
      estadoActivo: srv.estadoActivo || 'S',
      descripcion: srv.descripcion || '',
      metrica: srv.metrica || '',
      minimo: srv.minimo !== null && srv.minimo !== undefined ? String(srv.minimo) : '',
      maximo: srv.maximo !== null && srv.maximo !== undefined ? String(srv.maximo) : '',
      seccionResponsableId: String(srv.seccionResponsableId || ''),
      usuarioResponsableId: String(srv.usuarioResponsableId || ''),
    });
    setFormError(null);
    setFormSuccess(null);
    setShowFormModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validación cliente de Minimo <= Maximo
    if (formData.minimo !== '' && formData.maximo !== '') {
      if (parseFloat(formData.minimo) > parseFloat(formData.maximo)) {
        setFormError('El valor mínimo no puede ser mayor que el valor máximo.');
        return;
      }
    }

    const payload = {
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      servicioN1Id: parseInt(formData.servicioN1Id, 10),
      claseId: formData.claseId ? parseInt(formData.claseId, 10) : null,
      criticidadId: formData.criticidadId ? parseInt(formData.criticidadId, 10) : null,
      tipoId: formData.tipoId ? parseInt(formData.tipoId, 10) : null,
      estadoActivo: formData.estadoActivo,
      descripcion: formData.descripcion.trim() || null,
      metrica: formData.metrica.trim() || null,
      minimo: formData.minimo !== '' ? parseFloat(formData.minimo) : null,
      maximo: formData.maximo !== '' ? parseFloat(formData.maximo) : null,
      seccionResponsableId: formData.seccionResponsableId ? parseInt(formData.seccionResponsableId, 10) : null,
      usuarioResponsableId: formData.usuarioResponsableId ? parseInt(formData.usuarioResponsableId, 10) : null,
    };

    try {
      if (editingServiceId) {
        await api.catalog.updateService(editingServiceId, payload);
        setFormSuccess('Servicio actualizado exitosamente.');
      } else {
        await api.catalog.createService(payload);
        setFormSuccess('Servicio creado exitosamente.');
      }
      setTimeout(() => {
        setShowFormModal(false);
        loadServices();
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el servicio.');
    }
  };

  const availableUsersForSection = formData.seccionResponsableId
    ? usuarios.filter((u) => u.puesto?.seccion?.id === parseInt(formData.seccionResponsableId, 10))
    : [];

  if (authLoading || !user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2">
        <span className="font-mono text-xs text-zinc-400">Verificando sesión...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Catálogo ITIL
            </span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Catálogo de Servicios de TI</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Total en inventario: <span className="font-mono font-medium text-zinc-800">{total} servicios</span> (12 familias N1)
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nuevo Servicio</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por código, nombre..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 focus:outline-none focus:border-zinc-900"
            />
          </div>

          {/* Filter N1 */}
          <div>
            <select
              value={selectedN1}
              onChange={(e) => {
                setSelectedN1(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-md border border-zinc-200 focus:outline-none focus:border-zinc-900 bg-white text-zinc-700"
            >
              <option value="">Todas las Familias (Nivel 1)</option>
              {n1List.map((n1) => (
                <option key={n1.id} value={n1.id}>
                  {n1.codigo} &mdash; {n1.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Criticidad */}
          <div>
            <select
              value={selectedCrit}
              onChange={(e) => {
                setSelectedCrit(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-md border border-zinc-200 focus:outline-none focus:border-zinc-900 bg-white text-zinc-700"
            >
              <option value="">Todas las Criticidades</option>
              {criticidades.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
          {/* Filter Clase */}
          <div>
            <select
              value={selectedClase}
              onChange={(e) => {
                setSelectedClase(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-md border border-zinc-200 focus:outline-none focus:border-zinc-900 bg-white text-zinc-700"
            >
              <option value="">Todas las Clases</option>
              {clases.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tipo */}
          <div>
            <select
              value={selectedTipo}
              onChange={(e) => {
                setSelectedTipo(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs rounded-md border border-zinc-200 focus:outline-none focus:border-zinc-900 bg-white text-zinc-700"
            >
              <option value="">Todos los Tipos de Servicio</option>
              {tipos.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearch('');
                setSelectedN1('');
                setSelectedClase('');
                setSelectedCrit('');
                setSelectedTipo('');
                setSelectedActivo('');
                setPage(1);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400 font-mono">Cargando servicios del catálogo...</div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            No se encontraron servicios que coincidan con los criterios.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                <tr>
                  <th className="py-2.5 px-4 font-mono font-medium">Código</th>
                  <th className="py-2.5 px-4">Nombre del Servicio</th>
                  <th className="py-2.5 px-4">Nivel 1</th>
                  <th className="py-2.5 px-4">Clase</th>
                  <th className="py-2.5 px-4">Criticidad</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4">Métrica</th>
                  <th className="py-2.5 px-4">Umbrales</th>
                  <th className="py-2.5 px-4">Responsable (RACI)</th>
                  <th className="py-2.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-zinc-50/75 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-zinc-900">{srv.codigo}</td>
                    <td className="py-2.5 px-4 font-medium text-zinc-900 max-w-xs">{srv.nombre}</td>
                    <td className="py-2.5 px-4 text-zinc-500">{srv.servicioN1?.nombre || srv.servicioN1Id}</td>
                    <td className="py-2.5 px-4 text-zinc-600">{srv.clase?.nombre || '—'}</td>
                    <td className="py-2.5 px-4">
                      {srv.criticidad?.nombre ? (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-700">
                          {srv.criticidad.nombre}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-600">{srv.tipo?.nombre || '—'}</td>
                    <td className="py-2.5 px-4 text-zinc-600 font-mono text-[11px]">{srv.metrica || '—'}</td>
                    <td className="py-2.5 px-4 text-zinc-600">
                      {srv.minimo !== null && srv.maximo !== null ? (
                        <span className="font-mono text-[10px] text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded">
                          {srv.minimo} - {srv.maximo}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[10px]">N/A</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {srv.usuarioResponsable ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900 text-[11px]">{srv.usuarioResponsable.nombre}</span>
                          <span className="text-[10px] text-zinc-400">{srv.seccionResponsable?.nombre}</span>
                        </div>
                      ) : srv.seccionResponsable ? (
                        <span className="text-[11px] text-zinc-600">{srv.seccionResponsable.nombre}</span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenFicha(srv)}
                          title="Ficha Técnica"
                          className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEdit(srv)}
                            title="Editar"
                            className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2.5 bg-zinc-50 text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-white border border-zinc-200 rounded text-xs font-medium text-zinc-700 disabled:opacity-40 hover:bg-zinc-50"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-white border border-zinc-200 rounded text-xs font-medium text-zinc-700 disabled:opacity-40 hover:bg-zinc-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ficha Técnica del Servicio */}
      {showFicha && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-zinc-500" />
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                  Ficha Técnica de Servicio
                </h3>
              </div>
              <button
                onClick={() => setShowFicha(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Encabezado del servicio */}
              <div className="border-b border-zinc-100 pb-3">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 font-medium">
                  {selectedService.codigo}
                </span>
                <h2 className="text-base font-semibold text-zinc-900 mt-2">{selectedService.nombre}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Familia N1: <span className="font-medium text-zinc-700">{selectedService.servicioN1?.nombre || selectedService.servicioN1Id}</span>
                </p>
              </div>

              {/* Atributos ITIL */}
              <div className="grid grid-cols-3 gap-3 border border-zinc-200 rounded-md p-3 bg-zinc-50/50">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">Clase</span>
                  <p className="font-medium text-zinc-800 mt-0.5">{selectedService.clase?.nombre || 'Desconocido'}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">Criticidad</span>
                  <p className="font-medium text-zinc-800 mt-0.5">{selectedService.criticidad?.nombre || 'Desconocido'}</p>
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">Tipo</span>
                  <p className="font-medium text-zinc-800 mt-0.5">{selectedService.tipo?.nombre || 'Desconocido'}</p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">Descripción</span>
                <p className="text-zinc-700 mt-1 leading-relaxed bg-zinc-50 p-2.5 rounded border border-zinc-200">
                  {selectedService.descripcion || 'Sin descripción registrada.'}
                </p>
              </div>

              {/* Métrica y Umbrales */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-zinc-200 p-2.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">Métrica</span>
                  <p className="text-zinc-800 font-mono text-[11px] mt-0.5">{selectedService.metrica || 'No especificada'}</p>
                </div>
                <div className="rounded border border-zinc-200 p-2.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block">Umbrales</span>
                  <p className="text-zinc-800 font-mono text-[11px] mt-0.5">
                    {selectedService.minimo !== null && selectedService.maximo !== null ? (
                      <span>Min: {selectedService.minimo} &middot; Max: {selectedService.maximo}</span>
                    ) : (
                      <span className="text-zinc-400 italic">No aplican</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Gobernanza RACI */}
              <div className="border border-zinc-200 rounded p-3 bg-zinc-50/50">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-2">
                  Gobernanza RACI & ITIL
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Sección Responsable:</span>
                    <p className="font-medium text-zinc-800">{selectedService.seccionResponsable?.nombre || 'No asignada'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Service Owner (Accountable):</span>
                    <p className="font-medium text-zinc-800">{selectedService.usuarioResponsable?.nombre || 'No asignado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setShowFicha(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded hover:bg-zinc-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Servicio */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                {editingServiceId ? 'Editar Servicio N2' : 'Nuevo Servicio N2'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto text-xs">
              {formError && (
                <div className="p-2.5 rounded bg-zinc-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-2.5 rounded bg-zinc-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Código N2</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingServiceId}
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="SE.01.04"
                    className="w-full p-2 rounded border border-zinc-200 focus:border-zinc-900 focus:outline-none font-mono disabled:bg-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">Familia N1</label>
                  <select
                    required
                    value={formData.servicioN1Id}
                    onChange={(e) => setFormData({ ...formData, servicioN1Id: e.target.value })}
                    className="w-full p-2 rounded border border-zinc-200 focus:border-zinc-900 focus:outline-none bg-white"
                  >
                    <option value="">Seleccione Nivel 1...</option>
                    {n1List.map((n1) => (
                      <option key={n1.id} value={n1.id}>
                        {n1.codigo} &mdash; {n1.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre descriptivo del servicio"
                  className="w-full p-2 rounded border border-zinc-200 focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-600 mb-1">Clase</label>
                  <select
                    value={formData.claseId}
                    onChange={(e) => setFormData({ ...formData, claseId: e.target.value })}
                    className="w-full p-1.5 rounded border border-zinc-200 focus:border-zinc-900 focus:outline-none bg-white text-xs"
                  >
                    <option value="">Sin asignar</option>
                    {clases.map((cl) => (
                      <option key={cl.id} value={cl.id}>{cl.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-zinc-600 mb-1">Criticidad</label>
                  <select
                    value={formData.criticidadId}
                    onChange={(e) => setFormData({ ...formData, criticidadId: e.target.value })}
                    className="w-full p-1.5 rounded border border-zinc-200 focus:border-zinc-900 focus:outline-none bg-white text-xs"
                  >
                    <option value="">Sin asignar</option>
                    {criticidades.map((cr) => (
                      <option key={cr.id} value={cr.id}>{cr.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-zinc-600 mb-1">Tipo</label>
                  <select
                    value={formData.tipoId}
                    onChange={(e) => setFormData({ ...formData, tipoId: e.target.value })}
                    className="w-full p-1.5 rounded border border-zinc-200 focus:border-zinc-900 focus:outline-none bg-white text-xs"
                  >
                    <option value="">Sin asignar</option>
                    {tipos.map((tp) => (
                      <option key={tp.id} value={tp.id}>{tp.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Alcance o detalle"
                  className="w-full p-2 rounded border border-zinc-200 focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-600 mb-1">Métrica</label>
                  <input
                    type="text"
                    value={formData.metrica}
                    onChange={(e) => setFormData({ ...formData, metrica: e.target.value })}
                    placeholder="Ej. N° Solicitudes"
                    className="w-full p-1.5 rounded border border-zinc-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-zinc-600 mb-1">Mínimo</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.minimo}
                    onChange={(e) => setFormData({ ...formData, minimo: e.target.value })}
                    placeholder="NULL"
                    className="w-full p-1.5 rounded border border-zinc-200 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-zinc-600 mb-1">Máximo</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.maximo}
                    onChange={(e) => setFormData({ ...formData, maximo: e.target.value })}
                    placeholder="NULL"
                    className="w-full p-1.5 rounded border border-zinc-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Asignación RACI */}
              <div className="border border-zinc-200 rounded p-3 bg-zinc-50/50 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block">
                  Asignación RACI / ITIL (Regla P11)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-600 mb-1">Sección</label>
                    <select
                      value={formData.seccionResponsableId}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          seccionResponsableId: e.target.value,
                          usuarioResponsableId: '',
                        });
                      }}
                      className="w-full p-1.5 rounded border border-zinc-200 bg-white text-xs"
                    >
                      <option value="">Sin sección</option>
                      {secciones.map((sec) => (
                        <option key={sec.id} value={sec.id}>{sec.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-zinc-600 mb-1">Service Owner</label>
                    <select
                      disabled={!formData.seccionResponsableId}
                      value={formData.usuarioResponsableId}
                      onChange={(e) => setFormData({ ...formData, usuarioResponsableId: e.target.value })}
                      className="w-full p-1.5 rounded border border-zinc-200 bg-white text-xs disabled:bg-zinc-100"
                    >
                      <option value="">Sin usuario</option>
                      {availableUsersForSection.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
