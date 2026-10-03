'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  User,
  Briefcase,
  Layers,
  Plus,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';

export default function OrganizacionPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados de expansión de nodos
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Modal para crear nodo
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'empresa' | 'area' | 'depto' | 'seccion' | 'puesto' | 'usuario'>('area');
  const [parentId, setParentId] = useState<number | null>(null);
  const [parentName, setParentName] = useState<string>('');

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    username: '',
    email: '',
    password: '',
    rol: 'consulta',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadTree();
    }
  }, [user]);

  const loadTree = async () => {
    setLoading(true);
    try {
      const data = await api.organization.getTree();
      setTreeData(data);
      // Auto-expandir empresas y áreas al inicio
      const initialExpanded: Record<string, boolean> = {};
      data.forEach((emp) => {
        initialExpanded[`emp-${emp.id}`] = true;
        emp.areas?.forEach((area: any) => {
          initialExpanded[`area-${area.id}`] = true;
        });
      });
      setExpandedNodes(initialExpanded);
    } catch (err: any) {
      console.error('Error cargando estructura organizacional:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const handleOpenCreateModal = (type: any, pId?: number, pName?: string) => {
    setModalType(type);
    setParentId(pId || null);
    setParentName(pName || '');
    setFormData({
      codigo: '',
      nombre: '',
      username: '',
      email: '',
      password: '',
      rol: 'consulta',
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowModal(true);
  };

  const handleSubmitNode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (modalType === 'empresa') {
        await api.organization.createEmpresa({ codigo: formData.codigo, nombre: formData.nombre });
      } else if (modalType === 'area') {
        await api.organization.createArea({ empresaId: parentId, codigo: formData.codigo, nombre: formData.nombre });
      } else if (modalType === 'depto') {
        await api.organization.createDepartamento({ areaId: parentId, codigo: formData.codigo, nombre: formData.nombre });
      } else if (modalType === 'seccion') {
        await api.organization.createSeccion({ departamentoId: parentId, codigo: formData.codigo, nombre: formData.nombre });
      } else if (modalType === 'puesto') {
        await api.organization.createPuesto({ seccionId: parentId, codigo: formData.codigo, nombre: formData.nombre });
      } else if (modalType === 'usuario') {
        await api.organization.createUsuario({
          puestoId: parentId,
          nombre: formData.nombre,
          username: formData.username,
          email: formData.email,
          password: formData.password || 'Password123!',
          rol: formData.rol,
        });
      }

      setSuccessMsg('Elemento agregado exitosamente.');
      setTimeout(() => {
        setShowModal(false);
        loadTree();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar elemento.');
    }
  };

  const handleToggleActive = async (type: string, id: number, currentActive: boolean, name: string) => {
    if (!isAdmin) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (type === 'empresa') {
        await api.organization.updateEmpresa(id, { activo: !currentActive });
      } else if (type === 'area') {
        await api.organization.updateArea(id, { activo: !currentActive });
      } else if (type === 'depto') {
        await api.organization.updateDepartamento(id, { activo: !currentActive });
      } else if (type === 'seccion') {
        await api.organization.updateSeccion(id, { activo: !currentActive });
      } else if (type === 'puesto') {
        await api.organization.updatePuesto(id, { activo: !currentActive });
      } else if (type === 'usuario') {
        await api.organization.updateUsuario(id, { activo: !currentActive });
      }
      setSuccessMsg(`Estado de '${name}' actualizado.`);
      loadTree();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al modificar estado.');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Jerarquía Estricta
            </span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Estructura Organizacional</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Empresa &rarr; Área &rarr; Departamento &rarr; Sección &rarr; Puesto &rarr; Usuario
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleOpenCreateModal('empresa')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nueva Empresa</span>
          </button>
        )}
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-md bg-zinc-50 p-3.5 border border-red-200 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-2.5 rounded-md bg-zinc-50 p-3.5 border border-emerald-200 text-xs text-emerald-700">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tree Card */}
      <div className="rounded-lg border border-zinc-200 bg-white p-5">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono">Cargando árbol organizacional...</div>
        ) : treeData.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">No se encontraron entidades registradas.</div>
        ) : (
          <div className="space-y-3">
            {treeData.map((emp) => {
              const empKey = `emp-${emp.id}`;
              const isEmpExpanded = !!expandedNodes[empKey];

              return (
                <div key={emp.id} className="border border-zinc-200 rounded-md overflow-hidden bg-white">
                  {/* Empresa Row */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-50/75 border-b border-zinc-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNode(empKey)}
                        className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
                      >
                        {isEmpExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      <Building2 className="h-4 w-4 text-zinc-700" />
                      <span className="font-semibold text-zinc-900 text-xs">{emp.nombre}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded border border-zinc-200 bg-white text-zinc-600">
                        {emp.codigo}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            emp.activo ? 'bg-emerald-500' : 'bg-zinc-300'
                          }`}
                        />
                        <span className="font-mono text-[10px] text-zinc-500">
                          {emp.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1 ml-2 border-l border-zinc-200 pl-2">
                          <button
                            onClick={() => handleToggleActive('empresa', emp.id, emp.activo, emp.nombre)}
                            className="text-[11px] text-zinc-500 hover:text-red-600 px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-colors"
                          >
                            {emp.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleOpenCreateModal('area', emp.id, emp.nombre)}
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-700 hover:text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200 hover:border-zinc-300 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Área</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Areas Subtree */}
                  {isEmpExpanded && (
                    <div className="p-3 space-y-2.5 pl-6 border-l border-zinc-100 ml-3 my-2">
                      {emp.areas?.length === 0 ? (
                        <p className="text-[11px] text-zinc-400 italic">No hay áreas registradas.</p>
                      ) : (
                        emp.areas?.map((area: any) => {
                          const areaKey = `area-${area.id}`;
                          const isAreaExpanded = !!expandedNodes[areaKey];

                          return (
                            <div key={area.id} className="border border-zinc-200 rounded p-2.5 bg-white space-y-2">
                              {/* Area Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleNode(areaKey)}
                                    className="p-0.5 hover:bg-zinc-100 rounded text-zinc-400"
                                  >
                                    {isAreaExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  </button>
                                  <FolderTree className="h-3.5 w-3.5 text-zinc-600" />
                                  <span className="font-medium text-xs text-zinc-800">{area.nombre}</span>
                                  <span className="font-mono text-[10px] text-zinc-400">
                                    {area.codigo}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      area.activo ? 'bg-emerald-500' : 'bg-zinc-300'
                                    }`}
                                  />
                                  <span className="font-mono text-[10px] text-zinc-400">
                                    {area.activo ? 'ACTIVO' : 'INACTIVO'}
                                  </span>

                                  {isAdmin && (
                                    <div className="flex items-center gap-1 ml-2 border-l border-zinc-100 pl-2">
                                      <button
                                        onClick={() => handleToggleActive('area', area.id, area.activo, area.nombre)}
                                        className="text-[10px] text-zinc-400 hover:text-red-600"
                                      >
                                        {area.activo ? 'Desactivar' : 'Activar'}
                                      </button>
                                      <button
                                        onClick={() => handleOpenCreateModal('depto', area.id, area.nombre)}
                                        className="inline-flex items-center gap-0.5 text-[10px] font-medium text-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200 hover:border-zinc-300"
                                      >
                                        <Plus className="h-2.5 w-2.5" />
                                        <span>Dpto</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Departamentos */}
                              {isAreaExpanded && (
                                <div className="pl-4 space-y-2 border-l border-zinc-200 ml-2">
                                  {area.departamentos?.map((depto: any) => {
                                    const deptoKey = `depto-${depto.id}`;
                                    const isDeptoExpanded = !!expandedNodes[deptoKey];

                                    return (
                                      <div key={depto.id} className="p-2 rounded bg-zinc-50/50 border border-zinc-200 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => toggleNode(deptoKey)}
                                              className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400"
                                            >
                                              {isDeptoExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                            </button>
                                            <Layers className="h-3.5 w-3.5 text-zinc-600" />
                                            <span className="font-medium text-xs text-zinc-800">{depto.nombre}</span>
                                            <span className="font-mono text-[10px] text-zinc-400">{depto.codigo}</span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {isAdmin && (
                                              <>
                                                <button
                                                  onClick={() => handleToggleActive('depto', depto.id, depto.activo, depto.nombre)}
                                                  className="text-[10px] text-zinc-400 hover:text-red-600"
                                                >
                                                  {depto.activo ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button
                                                  onClick={() => handleOpenCreateModal('seccion', depto.id, depto.nombre)}
                                                  className="text-[10px] font-medium text-zinc-700 bg-white border border-zinc-200 px-1.5 py-0.5 rounded"
                                                >
                                                  + Sección
                                                </button>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        {/* Secciones */}
                                        {isDeptoExpanded && (
                                          <div className="pl-4 space-y-1.5 border-l border-zinc-200 ml-2">
                                            {depto.secciones?.map((sec: any) => {
                                              const secKey = `sec-${sec.id}`;
                                              const isSecExpanded = !!expandedNodes[secKey];

                                              return (
                                                <div key={sec.id} className="p-2 rounded bg-white border border-zinc-200 space-y-1.5">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                      <button
                                                        onClick={() => toggleNode(secKey)}
                                                        className="p-0.5 hover:bg-zinc-100 rounded text-zinc-400"
                                                      >
                                                        {isSecExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                      </button>
                                                      <Briefcase className="h-3 w-3 text-zinc-600" />
                                                      <span className="font-medium text-xs text-zinc-900">{sec.nombre}</span>
                                                      <span className="font-mono text-[9px] text-zinc-400">({sec.codigo})</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                      {isAdmin && (
                                                        <>
                                                          <button
                                                            onClick={() => handleToggleActive('seccion', sec.id, sec.activo, sec.nombre)}
                                                            className="text-[10px] text-zinc-400 hover:text-red-600"
                                                          >
                                                            {sec.activo ? 'Desactivar' : 'Activar'}
                                                          </button>
                                                          <button
                                                            onClick={() => handleOpenCreateModal('puesto', sec.id, sec.nombre)}
                                                            className="text-[10px] font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded"
                                                          >
                                                            + Puesto
                                                          </button>
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* Puestos y Usuarios */}
                                                  {isSecExpanded && (
                                                    <div className="pl-3.5 space-y-1 border-l border-zinc-200 ml-1 pt-1">
                                                      {sec.puestos?.map((pst: any) => (
                                                        <div key={pst.id} className="p-1.5 rounded bg-zinc-50 border border-zinc-100">
                                                          <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                              <span className="font-medium text-[11px] text-zinc-700">{pst.nombre}</span>
                                                              <span className="font-mono text-[9px] text-zinc-400">[{pst.codigo}]</span>
                                                            </div>
                                                            {isAdmin && (
                                                              <button
                                                                onClick={() => handleOpenCreateModal('usuario', pst.id, pst.nombre)}
                                                                className="text-[9px] font-medium text-zinc-700 bg-white border border-zinc-200 px-1.5 py-0.5 rounded"
                                                              >
                                                                + Usuario
                                                              </button>
                                                            )}
                                                          </div>

                                                          {/* Usuarios en este puesto */}
                                                          {pst.usuarios?.length > 0 && (
                                                            <div className="mt-1 space-y-1 pl-2.5 border-l border-zinc-200">
                                                              {pst.usuarios.map((u: any) => (
                                                                <div key={u.id} className="flex items-center justify-between text-[10px] text-zinc-600 py-0.5">
                                                                  <div className="flex items-center gap-1.5">
                                                                    <User className="h-3 w-3 text-zinc-400" />
                                                                    <span className="font-medium text-zinc-800">{u.nombre}</span>
                                                                    <span className="text-zinc-400 font-mono">({u.username})</span>
                                                                    <span className="px-1 py-0.2 rounded border border-zinc-200 bg-white text-[9px] font-mono uppercase text-zinc-500">{u.rol}</span>
                                                                  </div>

                                                                  {isAdmin && (
                                                                    <button
                                                                      onClick={() => handleToggleActive('usuario', u.id, u.activo, u.nombre)}
                                                                      className={`text-[9px] font-mono ${u.activo ? 'text-zinc-400 hover:text-red-600' : 'text-emerald-600'}`}
                                                                    >
                                                                      {u.activo ? 'Desactivar' : 'Activar'}
                                                                    </button>
                                                                  )}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          )}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Crear Nodo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-xl border border-zinc-200 p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Nuevo {modalType.toUpperCase()} {parentName ? `en '${parentName}'` : ''}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNode} className="space-y-3">
              {modalType !== 'usuario' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Código Único (en su padre)</label>
                    <input
                      type="text"
                      required
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                      placeholder="COD-01"
                      className="w-full p-2 rounded border border-zinc-200 font-mono text-xs focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Nombre descriptivo"
                      className="w-full p-2 rounded border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Juan Pérez"
                      className="w-full p-2 rounded border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Username Único</label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="jperez"
                      className="w-full p-2 rounded border border-zinc-200 font-mono text-xs focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jperez@usac.edu"
                      className="w-full p-2 rounded border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2 rounded border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 mb-1">Rol</label>
                    <select
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                      className="w-full p-2 rounded border border-zinc-200 bg-white text-xs focus:border-zinc-900 focus:outline-none"
                    >
                      <option value="consulta">consulta (Lectura)</option>
                      <option value="administrador">administrador (Control total)</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded text-xs"
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
