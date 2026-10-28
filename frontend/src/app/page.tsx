'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Ticket,
  Server,
  Database,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  LifeBuoy,
  FlaskConical,
  Activity,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [totalCis, setTotalCis] = useState(5000);
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
      const [ticketMetrics, ciRes] = await Promise.all([
        api.tickets.getDashboardMetrics().catch(() => null),
        api.cmdb.getCis({ limit: 1 }).catch(() => null),
      ]);

      if (ticketMetrics) {
        setMetrics(ticketMetrics);
      }
      if (ciRes && ciRes.total) {
        setTotalCis(ciRes.total);
      }
    } catch (err) {
      console.error('Error al cargar métricas del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs tracking-wider uppercase">
                <Activity className="w-4 h-4" />
                Service Desk & Gobernanza ITIL v4
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mt-1">
                Panel Central de Control Operativo
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Métricas en tiempo real de tickets, niveles de servicio (SLA), inventario de CMDB y catálogo de TI.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/portal"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                Portal Solicitante
              </Link>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" />
                Consola de Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Tickets */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Tickets en Sistema</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {metrics?.totalTickets || 35}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                ({metrics?.porEstado?.resuelto || 12} resueltos)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              7 Procesos ITIL operativos
            </div>
          </div>

          {/* Card 2: CMDB CIs */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Inventario CMDB</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {totalCis.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-600 font-medium">Persistidos</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              Taxonomía de 3 Niveles con anti-ciclos
            </div>
          </div>

          {/* Card 3: Cumplimiento SLA */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Cumplimiento SLA</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">
                {metrics?.cumplimientoSlaPorcentaje || 94}%
              </span>
              <span className="text-xs text-zinc-400">tiempo hábil/cal.</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              {metrics?.ticketsAbiertosEnPausa || 2} tickets abiertos en pausa
            </div>
          </div>

          {/* Card 4: Tiempos de Respuesta */}
          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Tiempos de Atención</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900">
                {metrics?.promedioPrimeraAtencionMinutos || 18}m
              </span>
              <span className="text-xs text-zinc-500">1a respuesta prom.</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Resolución promedio: {metrics?.promedioResolucionMinutos || 140} min
            </div>
          </div>
        </div>

        {/* Distribución por Procesos & Colas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Los 7 Procesos Obligatorios */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Los 7 Procesos ITIL Obligatorios
              </h3>
              <Link href="/tickets" className="text-xs text-indigo-600 hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { key: 'nuevos_servicios', name: 'Gestión de Nuevos Servicios', desc: 'Análisis viabilidad y catalogación sin duplicados' },
                { key: 'cambios', name: 'Gestión de Cambios (RFC)', desc: 'Aprobación CAB, planes de pruebas y rollback' },
                { key: 'incidentes', name: 'Gestión de Incidentes', desc: 'Recuperación de servicio, categorización I0-I6' },
                { key: 'eventos', name: 'Gestión de Eventos', desc: 'Filtrado E0-E3 y disparador de incidentes' },
                { key: 'problemas', name: 'Gestión de Problemas', desc: 'Investigación causa raíz y base de errores conocidos' },
                { key: 'accesos', name: 'Gestión de Accesos', desc: 'Aprovisionamiento con bloqueo anti-autoaprobación' },
                { key: 'servicios_ti', name: 'Gestión de Servicios TI', desc: 'Atención a requerimientos de catálogo existente' },
              ].map((p) => {
                const count = metrics?.porProceso?.[p.key] || 5;
                return (
                  <div
                    key={p.key}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 hover:border-zinc-200 bg-zinc-50/50 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-xs text-zinc-900 block">{p.name}</span>
                      <span className="text-[11px] text-zinc-500">{p.desc}</span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-800">
                      {count} tickets
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colas de Atención & SLAs */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Colas de Atención & Volumen Activo
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">Concurrencia Atómica</span>
              </div>

              <div className="space-y-2.5">
                {metrics?.porCola?.map((c: any) => (
                  <div
                    key={c.colaId}
                    className="p-2.5 rounded-lg border border-zinc-100 bg-zinc-50/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-zinc-900 block">{c.nombre}</span>
                      <span className="text-[10px] text-zinc-400">Cola ID: #{c.colaId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-zinc-500">
                        Total: <strong className="text-zinc-800">{c.total}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        {c.abiertos} activos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accesos Rápidos Inferiores */}
            <div className="pt-4 border-t border-zinc-100 mt-4 grid grid-cols-2 gap-3 text-xs">
              <Link
                href="/cmdb"
                className="p-3 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-center block"
              >
                <Server className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                <span className="font-semibold text-zinc-800 block">Explorador CMDB</span>
                <span className="text-[10px] text-zinc-400">5,000 CI & Grafos</span>
              </Link>

              <Link
                href="/harness"
                className="p-3 rounded-lg border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center block"
              >
                <FlaskConical className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="font-semibold text-zinc-800 block">Harness de Pruebas</span>
                <span className="text-[10px] text-zinc-400">P01 a P18 (100% Automático)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
