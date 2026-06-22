import React, { createContext, useCallback, useContext, useState } from 'react';
import type { ClientAccount, ClientVisit } from '@/types/auth';
import { marketplaceApi } from '@/lib/api';
// We will store token in localStorage 'app_user_token'
const getStoredToken = () => localStorage.getItem('app_user_token');
const setStoredToken = (t: string) => localStorage.setItem('app_user_token', t);
const clearStoredToken = () => localStorage.removeItem('app_user_token');
const getStoredClient = () => {
  const c = localStorage.getItem('app_user_data');
  return c ? JSON.parse(c) : null;
};
const setStoredClient = (c: any) => localStorage.setItem('app_user_data', JSON.stringify(c));
const clearStoredClient = () => localStorage.removeItem('app_user_data');

interface Ctx {
  client: ClientAccount | null;
  isAuthenticated: boolean;
  signup: (i: { nom: string; email: string; password: string; telephone?: string }) => Promise<{ ok: true } | { ok: false; reason: string }>;
  signin: (email: string, password: string) => Promise<{ ok: true } | { ok: false; reason: string }>;
  googleLogin: (token: string) => Promise<{ ok: true } | { ok: false; reason: string }>;
  signout: () => void;
  toggleFavorite: (salonId: string) => Promise<void>;
  isFavorite: (salonId: string) => boolean;
  logVisit: (v: Omit<ClientVisit, 'visitedAt'>) => void;
  update: (patch: Partial<ClientAccount>) => void;
  token: string | null;
}

const ClientAuthContext = createContext<Ctx | null>(null);

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<any | null>(() => getStoredClient());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const signup: Ctx['signup'] = useCallback(async (i) => {
    try {
      const r = await marketplaceApi.register(i);
      if (r.success) {
        setToken(r.token); setStoredToken(r.token);
        setClient(r.user); setStoredClient(r.user);
        return { ok: true };
      }
      return { ok: false, reason: r.message || 'Erreur lors de l\'inscription' };
    } catch(e: any) { return { ok: false, reason: e.message }; }
  }, []);

  const signin: Ctx['signin'] = useCallback(async (e, p) => {
    try {
      const r = await marketplaceApi.login({ email: e, password: p });
      if (r.success) {
        setToken(r.token); setStoredToken(r.token);
        setClient(r.user); setStoredClient(r.user);
        return { ok: true };
      }
      return { ok: false, reason: r.message || 'Identifiants invalides' };
    } catch(e: any) { return { ok: false, reason: e.message }; }
  }, []);

  const googleLogin: Ctx['googleLogin'] = useCallback(async (gToken: string) => {
    try {
      // Create googleLogin method in API file if it doesn't exist, or just use fetch
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/marketplace/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: gToken })
      });
      const r = await res.json();
      if (r.success) {
        setToken(r.token); setStoredToken(r.token);
        setClient(r.user); setStoredClient(r.user);
        return { ok: true };
      }
      return { ok: false, reason: r.message || 'Erreur Google Auth' };
    } catch (e: any) { return { ok: false, reason: e.message }; }
  }, []);

  const signout = useCallback(() => { 
    clearStoredToken(); clearStoredClient(); setClient(null); setToken(null); 
  }, []);

  const toggleFavorite = useCallback(async (salonId: string) => {
    // Ideally this hits the backend, but for now we update local state
    if (!client || !salonId) return;
    const favs = client.favoris || [];
    const isFav = favs.some((f: any) => f._id === salonId || f === salonId);
    let newFavs = isFav ? favs.filter((f: any) => f._id !== salonId && f !== salonId) : [...favs, salonId];
    const newClient = { ...client, favoris: newFavs };
    setClient(newClient); setStoredClient(newClient);
  }, [client]);

  const isFavorite = useCallback((salonId: string) => {
    if (!client || !client.favoris || !salonId) return false;
    return client.favoris.some((f: any) => f._id === salonId || f === salonId);
  }, [client]);

  const logVisit = useCallback((v: Omit<ClientVisit, 'visitedAt'>) => {
    // not used strictly anymore
  }, [client]);

  const update = useCallback((patch: Partial<ClientAccount>) => {
    if (!client) return;
    const u = { ...client, ...patch };
    setClient(u); setStoredClient(u);
  }, [client]);

  return (
    <ClientAuthContext.Provider value={{
      client, isAuthenticated: !!client, signup, signin, googleLogin, signout,
      toggleFavorite, isFavorite, logVisit, update, token
    }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const c = useContext(ClientAuthContext);
  if (!c) throw new Error('useClientAuth must be used within ClientAuthProvider');
  return c;
}