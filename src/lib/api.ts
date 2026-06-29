const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5500/api/v1';

type ApiEnvelope<T> = { success: boolean; data: T };

function unwrap<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// Attempts to refresh whichever session the expired token belongs to.
// Returns the new access token on success, null if refresh is not possible.
async function attemptTokenRefresh(usedToken: string): Promise<string | null> {
  const adminToken = sessionStorage.getItem('bokko_admin_token');
  const vendorToken = sessionStorage.getItem('bokko_vendor_token');

  let refreshKey: string;
  let accessKey: string;

  if (usedToken === adminToken) {
    refreshKey = 'bokko_admin_refresh';
    accessKey = 'bokko_admin_token';
  } else if (usedToken === vendorToken) {
    refreshKey = 'bokko_vendor_refresh';
    accessKey = 'bokko_vendor_token';
  } else {
    return null;
  }

  const refreshToken = sessionStorage.getItem(refreshKey);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = unwrap<{ accessToken: string; refreshToken?: string }>(json);
    sessionStorage.setItem(accessKey, data.accessToken);
    if (data.refreshToken) sessionStorage.setItem(refreshKey, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const makeRequest = async (t?: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (t) headers['Authorization'] = `Bearer ${t}`;
    return fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  };

  let res = await makeRequest(token);
  if (res.status === 401 && token) {
    const newToken = await attemptTokenRefresh(token);
    if (newToken) res = await makeRequest(newToken);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; code?: string };
    throw new ApiError(err.message ?? `Error ${res.status}`, err.code, res.status);
  }
  return unwrap<T>(await res.json());
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const makeRequest = async (t?: string) => {
    const headers: Record<string, string> = {};
    if (t) headers['Authorization'] = `Bearer ${t}`;
    return fetch(`${BASE}${path}`, { headers });
  };

  let res = await makeRequest(token);
  if (res.status === 401 && token) {
    const newToken = await attemptTokenRefresh(token);
    if (newToken) res = await makeRequest(newToken);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; code?: string };
    throw new ApiError(err.message ?? `Error ${res.status}`, err.code, res.status);
  }
  return unwrap<T>(await res.json());
}

export async function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  const makeRequest = async (t?: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (t) headers['Authorization'] = `Bearer ${t}`;
    return fetch(`${BASE}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) });
  };

  let res = await makeRequest(token);
  if (res.status === 401 && token) {
    const newToken = await attemptTokenRefresh(token);
    if (newToken) res = await makeRequest(newToken);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; code?: string };
    throw new ApiError(err.message ?? `Error ${res.status}`, err.code, res.status);
  }
  return unwrap<T>(await res.json());
}

export async function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  const makeRequest = async (t?: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (t) headers['Authorization'] = `Bearer ${t}`;
    return fetch(`${BASE}${path}`, { method: 'PUT', headers, body: JSON.stringify(body) });
  };

  let res = await makeRequest(token);
  if (res.status === 401 && token) {
    const newToken = await attemptTokenRefresh(token);
    if (newToken) res = await makeRequest(newToken);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; code?: string };
    throw new ApiError(err.message ?? `Error ${res.status}`, err.code, res.status);
  }
  return unwrap<T>(await res.json());
}

export async function apiUploadFile<T>(path: string, formData: FormData, token?: string): Promise<T> {
  const makeRequest = async (t?: string) => {
    const headers: Record<string, string> = {};
    if (t) headers['Authorization'] = `Bearer ${t}`;
    return fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData });
  };

  let res = await makeRequest(token);
  if (res.status === 401 && token) {
    const newToken = await attemptTokenRefresh(token);
    if (newToken) res = await makeRequest(newToken);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; code?: string };
    throw new ApiError(err.message ?? `Error ${res.status}`, err.code, res.status);
  }
  return unwrap<T>(await res.json());
}

export const getAdminToken = () => sessionStorage.getItem('bokko_admin_token');
export const getVendorToken = () => sessionStorage.getItem('bokko_vendor_token');
export const getCentreId = () => sessionStorage.getItem('bokko_centre_id');
export const setCentreId = (id: string) => sessionStorage.setItem('bokko_centre_id', id);
