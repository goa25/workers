// i-Pledge Carbon Platform: API Client
// Base fetch wrapper with auth header + error handling

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://ipledge-api.azurewebsites.net/api';

export function getToken(): string | null {
  return localStorage.getItem('ipledge_token');
}

export function setToken(token: string): void {
  localStorage.setItem('ipledge_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('ipledge_token');
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();
  const { body, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rest.headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, (err as { error?: string }).error || res.statusText);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
