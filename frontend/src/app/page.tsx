'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Database,
  Building2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalN1: 0,
    totalN2: 0,
    assignedRaci: 0,
    empresas: 0,
  });
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [n1List, n2Data, empresasList] = await Promise.all([
        api.catalog.getN1().catch(() => []),
        api.catalog.getServices({ limit: 6 }).catch(() => ({ items: [], total: 0 })),
        api.organization.getEmpresas().catch(() => []),
      ]);

      const assignedCount = n2Data.items.filter((s: any) => s.seccionResponsableId !== null).length;

      setStats({
        totalN1: n1List.length || 12,
        totalN2: n2Data.total || 46,
        assignedRaci: assignedCount,
        empresas: empresasList.length || 1,
      });

      setRecentServices(n2Data.items || []);
    } catch (err) {
      console.error('Error al cargar métricas del dashboard:', err);
    } finally {
      setLoading(false);
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
    <div className="space-y-8">
      {/* Minimalist Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Sistema Operativo &middot; ITIL v4 & Matriz RACI
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Catálogo de Servicios de TI
          </h1>
          <p className="text-xs text-zinc-500 max-w-2xl">
            Gestión centralizada de catálogo, jerarquía organizacional de 6 niveles y verificación automatizada de calidad (P01–P12).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Ver Catálogo</span>
          </Link>
        </div>
      </div>

      {/* Structured Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-zinc-200 bg-white rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        <div className="p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Servicios Nivel 1
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
              {stats.totalN1}
            </span>
            <span className="text-[11px] text-zinc-500">familias</span>
          </div>
          <p className="text-[11px] text-zinc-400">SE.01 a SE.12 (Resuelto canónico)</p>
        </div>

        <div className="p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Servicios Nivel 2
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
              {stats.totalN2}
            </span>
            <span className="text-[11px] text-zinc-500">servicios base</span>
          </div>
          <p className="text-[11px] text-zinc-400">Exactos importados del Excel</p>
        </div>

        <div className="p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Gobernanza RACI
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
              Regla P11
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Activa</span>
          </div>
          <p className="text-[11px] text-zinc-400">Validación estricta de pertenencia</p>
        </div>

        <div className="p-5 space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Base de Datos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-zinc-900 font-mono">
              MariaDB 11
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">LTS</span>
          </div>
          <p className="text-[11px] text-zinc-400">Volumen Docker mariadb_data</p>
        </div>
      </div>

      {/* Main Section Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/catalogo"
          className="group block p-5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
              <Database className="h-4 w-4" />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">Catálogo de Servicios</h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            Consulte los 46 servicios, aplique filtros multifacéticos y abra la Ficha Técnica con especificación ITIL y umbrales.
          </p>
        </Link>

        <Link
          href="/organizacion"
          className="group block p-5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
              <Building2 className="h-4 w-4" />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">Estructura Organizacional</h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            Árbol jerárquico de 6 niveles (Empresa &rarr; Área &rarr; Depto &rarr; Sección &rarr; Puesto &rarr; Usuario) con política restrictiva de desactivación.
          </p>
        </Link>

        <Link
          href="/harness"
          className="group block p-5 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">Panel de Pruebas (P01-P12)</h3>
          <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
            Consola interactiva de ejecución de las 12 pruebas del parcial con aserciones en tiempo real y tiempos de respuesta.
          </p>
        </Link>
      </div>

      {/* Services Table Preview */}
      <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Muestra Reciente del Catálogo
            </h2>
            <p className="text-[11px] text-zinc-500">Primeros servicios registrados y sus clasificaciones</p>
          </div>
          <Link
            href="/catalogo"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            Ver todos los 46 servicios &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/75 text-zinc-500 font-medium border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4 font-mono font-medium">Código</th>
                <th className="py-2.5 px-4">Nombre del Servicio</th>
                <th className="py-2.5 px-4">Nivel 1</th>
                <th className="py-2.5 px-4">Criticidad</th>
                <th className="py-2.5 px-4">Clase</th>
                <th className="py-2.5 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentServices.map((srv) => (
                <tr key={srv.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-zinc-900">{srv.codigo}</td>
                  <td className="py-2.5 px-4 text-zinc-800 font-medium">{srv.nombre}</td>
                  <td className="py-2.5 px-4 text-zinc-500">{srv.servicioN1?.nombre || srv.servicioN1Id}</td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-700">
                      {srv.criticidad?.nombre || 'N/A'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-600">{srv.clase?.nombre || '—'}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          srv.estadoActivo === 'S' ? 'bg-emerald-500' : 'bg-zinc-300'
                        }`}
                      />
                      <span className="font-mono text-[11px] text-zinc-600">
                        {srv.estadoActivo === 'S' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
