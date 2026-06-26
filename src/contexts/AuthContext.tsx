import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthSession, SalonAccount, SalonUser } from '@/types/auth';
import {
  getSession,
  setSession as saveSession,
  clearSession,
  verifyAdmin,
  verifySalonLogin,
  isSalonSubscriptionActive,
  getSalonAccounts,
} from '@/lib/auth';
import { authApi } from '@/lib/api';

interface AuthContextType {
  session: AuthSession | null;
  currentSalon: SalonAccount | null;
  currentUser: SalonUser | null;
  isSubscriptionValid: boolean;
  loginAdmin: (email: string, password: string) => boolean;
  loginSalon: (email: string, password: string) => { success: boolean; reason?: string };
  logout: () => void;
  setSession: (session: AuthSession | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getSession());

  // Charger automatiquement la session depuis le token JWT en local au démarrage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !session) {
      authApi.getMe(token)
        .then(data => {
          if (data.success && data.session) {
            const mappedSession: AuthSession = {
              type: 'salon',
              salonId: data.session.salonId || undefined,
              userId: data.session.userId,
              userRole: data.session.userRole,
              userName: data.session.userName,
              email: data.session.userEmail,
              timestamp: Date.now()
            };
            saveSession(mappedSession);
            setSessionState(mappedSession);
          }
        })
        .catch(err => {
          console.error('Erreur de restauration de la session via token:', err);
          localStorage.removeItem('token');
        });
    }
  }, [session]);

  const currentSalon = session?.type === 'salon' && session.salonId
    ? getSalonAccounts().find(s => s.id === session.salonId) || null
    : null;

  const currentUser = currentSalon && session?.userId
    ? (currentSalon.users || []).find(u => u.id === session.userId) || null
    : null;

  const isSubscriptionValid = currentSalon ? isSalonSubscriptionActive(currentSalon) : false;

  const loginAdmin = useCallback((email: string, password: string): boolean => {
    if (verifyAdmin(email, password)) {
      const s: AuthSession = { type: 'admin', email, timestamp: Date.now() };
      saveSession(s);
      setSessionState(s);
      return true;
    }
    return false;
  }, []);

  const loginSalon = useCallback((email: string, password: string): { success: boolean; reason?: string } => {
    const result = verifySalonLogin(email, password);
    if (!result) return { success: false, reason: 'Identifiants incorrects' };
    if (!isSalonSubscriptionActive(result.salon)) {
      return { success: false, reason: 'Votre abonnement a expiré. Contactez LeaderBright pour le renouvellement.' };
    }
    const s: AuthSession = {
      type: 'salon',
      salonId: result.salon.id,
      userId: result.user.id,
      userRole: result.user.role,
      userName: result.user.nom,
      email,
      timestamp: Date.now(),
    };
    saveSession(s);
    setSessionState(s);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    clearSession();
    setSessionState(null);
  }, []);

  const setSession = useCallback((newSession: AuthSession | null) => {
    if (newSession) {
      saveSession(newSession);
    } else {
      localStorage.removeItem('token');
      clearSession();
    }
    setSessionState(newSession);
  }, []);

  return (
    <AuthContext.Provider value={{ session, currentSalon, currentUser, isSubscriptionValid, loginAdmin, loginSalon, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
