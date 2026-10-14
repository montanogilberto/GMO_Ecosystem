// Connection to the GMO web platform API (Agent_POSGMO/posgmo-factory/business_intake_api.py):
// the Business Intake agent plus the commercial core — visit counter, AI token
// allowance, leads. The address comes from VITE_INTAKE_API_URL (see .env.example).

/** Without VITE_INTAKE_API_URL, only local development has a fallback: the API on this machine or the
 *  local network, port 8090 (127.0.0.1 instead of "localhost" so IPv6/IPv4 differences can't break it).
 *  A public site (e.g. https://www.gmoecosystem.com) gets NO fallback — guessing http://<site>:8090 there
 *  is blocked by the browser as mixed content — so the API features turn off until it is configured. */
function defaultApiUrl(): string {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  const local = host === "" || host === "localhost" || host === "127.0.0.1"
    || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  if (!local) return "";
  return `http://${host === "" || host === "localhost" ? "127.0.0.1" : host}:8090`;
}

export const API_URL = (import.meta.env.VITE_INTAKE_API_URL || defaultApiUrl()).replace(/\/$/, "");

/** False on a deployed site built without VITE_INTAKE_API_URL: Ask, the visit counter and the token bar stay off. */
export const API_CONFIGURED = API_URL !== "";

/** Login of the existing GMO web operations platform, where companies operate day to day. */
export const LOGIN_URL = import.meta.env.VITE_GMO_LOGIN_URL || "https://mango-smoke-0323ed91e.3.azurestaticapps.net/login";

const VISITOR_KEY = "gmo-visitor";
let memoryVisitorId: string | null = null;

/** Anonymous id for this browser (no personal data): counts visits and AI tokens. */
export function visitorId(): string {
  try {
    const saved = localStorage.getItem(VISITOR_KEY);
    if (saved) return saved;
  } catch { /* storage blocked: fall back to an id for this page load */ }
  const id = memoryVisitorId ?? `v_${(crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^A-Za-z0-9]/g, "").slice(0, 32)}`;
  memoryVisitorId = id;
  try { localStorage.setItem(VISITOR_KEY, id); } catch { /* not remembered */ }
  return id;
}

export type Allowance = { used: number; allowance: number; remaining: number; registered: boolean };

export class ApiError extends Error {
  constructor(public status: number, public detail: unknown) {
    super(`API error ${status}`);
  }
}

/** JSON request to the platform API; throws ApiError for non-2xx answers. */
export async function api<T>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string>; signal?: AbortSignal } = {}): Promise<T> {
  if (!API_CONFIGURED) throw new ApiError(0, "API not configured (VITE_INTAKE_API_URL)");
  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: { ...(init.body === undefined ? {} : { "Content-Type": "application/json" }), ...init.headers },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: init.signal,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, (data as { detail?: unknown } | null)?.detail ?? data);
  return data as T;
}
