'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Database,
  Building2,
  FileSpreadsheet,
  LogOut,
  FlaskConical,
  Ticket,
  Server,
  LifeBuoy,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  if (pathname === '/login') {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Layers },
    { label: 'Portal Solicitante', href: '/portal', icon: LifeBuoy },
    { label: 'Tickets & Colas', href: '/tickets', icon: Ticket },
    { label: 'CMDB (5,000 CI)', href: '/cmdb', icon: Server },
    { label: 'Catálogo', href: '/catalogo', icon: Database },
    { label: 'Organización', href: '/organizacion', icon: Building2 },
    { label: 'Importador', href: '/importador', icon: FileSpreadsheet },
  ];

  const isHarnessActive = pathname === '/harness';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded overflow-hidden border border-zinc-200 flex items-center justify-center bg-zinc-900">
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={28}
                height={28}
                className="object-cover invert opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors">
                Service Desk & CMDB
              </span>
              <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
                USAC
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links - Functional Core */}
        {user && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Evaluation Test Suite + User Info & Actions */}
        <div className="flex items-center gap-3">
          {/* Distinct Evaluation Testing Button */}
          <Link
            href="/harness"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
              isHarnessActive
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-300'
            }`}
            title="Suite de Pruebas Automatizadas para Evaluación P01 a P18"
          >
            <FlaskConical className={`h-3.5 w-3.5 ${isHarnessActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span className="font-medium">Pruebas (P01-P18)</span>
          </Link>

          <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block" />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-800">{user.nombre}</span>
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider ${
                      isAdmin
                        ? 'border-zinc-300 bg-zinc-100 text-zinc-800'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                    }`}
                  >
                    {user.rol}
                  </span>
                </div>
              </div>

              <button
                onClick={() => logout()}
                title="Cerrar sesión"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-md border border-transparent hover:border-zinc-200 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-xs">Salir</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
