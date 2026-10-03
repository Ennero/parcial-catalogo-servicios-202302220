'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al autenticar. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type: 'admin' | 'consulta' | 'seguridad' | 'soporte' | 'analista' | 'inactivo') => {
    switch (type) {
      case 'admin':
        setIdentifier('admin@usac.edu');
        setPassword('Admin123!');
        break;
      case 'consulta':
        setIdentifier('consulta@usac.edu');
        setPassword('Consulta123!');
        break;
      case 'seguridad':
        setIdentifier('seguridad@usac.edu');
        setPassword('Seguridad123!');
        break;
      case 'soporte':
        setIdentifier('soporte@usac.edu');
        setPassword('Soporte123!');
        break;
      case 'analista':
        setIdentifier('analista@usac.edu');
        setPassword('Analista123!');
        break;
      case 'inactivo':
        setIdentifier('inactivo@usac.edu');
        setPassword('Inactivo123!');
        break;
    }
    setError(null);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center p-2">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
        {/* Left column: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-zinc-900" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Acceso al Sistema
              </span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Catálogo de Servicios de TI & Gobernanza Organizacional ITIL/RACI.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-md bg-zinc-50 p-3 border border-red-200 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 uppercase tracking-wider mb-1.5">
                Usuario o Correo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@usac.edu"
                  className="block w-full rounded-md border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-md border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials for Evaluation */}
          <div className="border-t border-zinc-100 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Perfiles y Cuentas de Demostración
              </span>
              <span className="font-mono text-[9px] text-zinc-400">Clic para rellenar</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin')}
                className="p-2 rounded-md border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/60 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-800">Admin</span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-zinc-200/80 text-zinc-700 uppercase">ADMIN</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate">admin@usac.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('consulta')}
                className="p-2 rounded-md border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/60 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-800">Auditor</span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-500 uppercase">CONSULTA</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate">consulta@usac.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('seguridad')}
                className="p-2 rounded-md border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/60 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-800">CISO TI</span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-zinc-200/80 text-zinc-700 uppercase">ADMIN</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate">seguridad@usac.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('soporte')}
                className="p-2 rounded-md border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/60 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-800">Help Desk</span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-500 uppercase">CONSULTA</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate">soporte@usac.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('analista')}
                className="p-2 rounded-md border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/60 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-800">Analista BI</span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-zinc-100 text-zinc-500 uppercase">CONSULTA</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate">analista@usac.edu</p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('inactivo')}
                className="p-2 rounded-md border border-red-200/70 hover:border-red-300 bg-red-50/30 hover:bg-red-50/60 text-left transition-all"
                title="Usuario inactivo para comprobar el rechazo del escenario P02"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-red-800">Inactivo</span>
                  <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-red-100 text-red-700 uppercase">TEST P02</span>
                </div>
                <p className="text-[9px] text-red-600/80 font-mono mt-0.5 truncate">inactivo@usac.edu</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Minimalist Graphic / Visual */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-zinc-900 text-white overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
              USAC &middot; FIUSAC
            </span>
            <h2 className="text-base font-medium tracking-tight text-white">
              Arquitectura de Servicios & Gobernanza
            </h2>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full aspect-[16/10] relative rounded-md overflow-hidden border border-zinc-800">
              <Image
                src="/hero.jpg"
                alt="Arquitectura Organizacional"
                fill
                priority
                className="object-cover opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div className="relative z-10 border-t border-zinc-800/80 pt-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>ITIL v4 &middot; RACI</span>
            <span>v1.2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
