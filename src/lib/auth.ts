const KEY = "scm_auth_v1";
export const DEMO_USER = "SupplyChainAdmin";
export const DEMO_PASS = "SupplyChainPassword";

export type AuthState = { authed: boolean; user?: string };

export function getAuth(): AuthState {
  if (typeof window === "undefined") return { authed: false };
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return { authed: false }; }
}
export function setAuth(s: AuthState) { localStorage.setItem(KEY, JSON.stringify(s)); }
export function logout() { localStorage.removeItem(KEY); }
