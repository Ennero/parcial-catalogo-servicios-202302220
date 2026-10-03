const API_BASE = '/api';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !endpoint.includes('/auth/login')) {
    setAuthToken(null);
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || (Array.isArray(data?.message) ? data.message.join(', ') : 'Error en la petición al servidor.');
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (identifier: string, pass: string) =>
      request<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password: pass }),
      }),
    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
    me: () => request<any>('/auth/me'),
  },

  // Catálogo
  catalog: {
    getServices: (params: Record<string, any> = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
      });
      return request<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>(
        `/catalog/n2?${q.toString()}`,
      );
    },
    getServiceById: (id: number) => request<any>(`/catalog/n2/${id}`),
    createService: (data: any) =>
      request<any>('/catalog/n2', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateService: (id: number, data: any) =>
      request<any>(`/catalog/n2/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getN1: () => request<any[]>('/catalog/n1'),
    getClases: () => request<any[]>('/catalog/clases'),
    getCriticidades: () => request<any[]>('/catalog/criticidades'),
    getTipos: () => request<any[]>('/catalog/tipos'),
  },

  // Organización
  organization: {
    getTree: () => request<any[]>('/organization/tree'),
    getEmpresas: () => request<any[]>('/organization/empresas'),
    getAreas: (empresaId?: number) =>
      request<any[]>(`/organization/areas${empresaId ? `?empresaId=${empresaId}` : ''}`),
    getDepartamentos: (areaId?: number) =>
      request<any[]>(`/organization/departamentos${areaId ? `?areaId=${areaId}` : ''}`),
    getSecciones: (departamentoId?: number) =>
      request<any[]>(`/organization/secciones${departamentoId ? `?departamentoId=${departamentoId}` : ''}`),
    getPuestos: (seccionId?: number) =>
      request<any[]>(`/organization/puestos${seccionId ? `?seccionId=${seccionId}` : ''}`),
    getUsuarios: () => request<any[]>('/organization/usuarios'),
    createEmpresa: (data: any) => request<any>('/organization/empresas', { method: 'POST', body: JSON.stringify(data) }),
    updateEmpresa: (id: number, data: any) => request<any>(`/organization/empresas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    createArea: (data: any) => request<any>('/organization/areas', { method: 'POST', body: JSON.stringify(data) }),
    updateArea: (id: number, data: any) => request<any>(`/organization/areas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    createDepartamento: (data: any) => request<any>('/organization/departamentos', { method: 'POST', body: JSON.stringify(data) }),
    updateDepartamento: (id: number, data: any) => request<any>(`/organization/departamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    createSeccion: (data: any) => request<any>('/organization/secciones', { method: 'POST', body: JSON.stringify(data) }),
    updateSeccion: (id: number, data: any) => request<any>(`/organization/secciones/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    createPuesto: (data: any) => request<any>('/organization/puestos', { method: 'POST', body: JSON.stringify(data) }),
    updatePuesto: (id: number, data: any) => request<any>(`/organization/puestos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    createUsuario: (data: any) => request<any>('/organization/usuarios', { method: 'POST', body: JSON.stringify(data) }),
    updateUsuario: (id: number, data: any) => request<any>(`/organization/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Importador
  importer: {
    run: (filePath?: string) =>
      request<any>('/catalog/import', {
        method: 'POST',
        body: JSON.stringify({ filePath }),
      }),
    getLogs: () => request<any[]>('/catalog/import/logs'),
  },

  // Harness
  harness: {
    getStatus: () => request<any>('/harness/status'),
    run: () =>
      request<any>('/harness/run', {
        method: 'POST',
      }),
  },
};
