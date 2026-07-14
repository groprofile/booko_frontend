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

// The backend rotates (single-use) refresh tokens: each successful refresh
// deletes the old session. If several requests 401 at once with the same
// expired access token, they must NOT each fire their own refresh — only the
// first would succeed and the rest would fail with "unauthorized". So we
// de-duplicate concurrent refreshes per session and remember the replacement
// for any request that 401s just after the refresh already completed.

type Session = { accessKey: string; refreshKey: string };

function sessionForToken(token: string): Session | null {
  if (token === sessionStorage.getItem('bokko_admin_token')) {
    return { accessKey: 'bokko_admin_token', refreshKey: 'bokko_admin_refresh' };
  }
  if (token === sessionStorage.getItem('bokko_vendor_token')) {
    return { accessKey: 'bokko_vendor_token', refreshKey: 'bokko_vendor_refresh' };
  }
  if (token === sessionStorage.getItem('bokko_user_token')) {
    return { accessKey: 'bokko_user_token', refreshKey: 'bokko_user_refresh' };
  }
  return null;
}

// One in-flight refresh per session (keyed by accessKey) so concurrent 401s
// share a single network refresh instead of racing the one-time refresh token.
const inFlightRefresh: Record<string, Promise<string | null> | undefined> = {};

// Maps an expired access token to the access token that replaced it, so a
// request that 401s slightly after another already refreshed can still recover.
const tokenReplacements = new Map<string, string>();

async function doRefresh(session: Session, usedToken: string): Promise<string | null> {
  const refreshToken = sessionStorage.getItem(session.refreshKey);
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
    sessionStorage.setItem(session.accessKey, data.accessToken);
    if (data.refreshToken) sessionStorage.setItem(session.refreshKey, data.refreshToken);
    if (tokenReplacements.size > 20) tokenReplacements.clear();
    tokenReplacements.set(usedToken, data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

// Attempts to refresh whichever session the expired token belongs to.
// Returns the new access token on success, null if refresh is not possible.
async function attemptTokenRefresh(usedToken: string): Promise<string | null> {
  // A concurrent request already refreshed this exact token — reuse the result.
  const replaced = tokenReplacements.get(usedToken);
  if (replaced) return replaced;

  const session = sessionForToken(usedToken);
  if (!session) return null;

  // Share a single refresh across all callers racing on the same session.
  const existing = inFlightRefresh[session.accessKey];
  if (existing) return existing;

  const p = doRefresh(session, usedToken).finally(() => {
    delete inFlightRefresh[session.accessKey];
  });
  inFlightRefresh[session.accessKey] = p;
  return p;
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

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
  const makeRequest = async (t?: string) => {
    const headers: Record<string, string> = {};
    if (t) headers['Authorization'] = `Bearer ${t}`;
    return fetch(`${BASE}${path}`, { method: 'DELETE', headers });
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
export const getUserToken = () => sessionStorage.getItem('bokko_user_token');
export const getCentreId = () => sessionStorage.getItem('bokko_centre_id');
export const setCentreId = (id: string) => sessionStorage.setItem('bokko_centre_id', id);
