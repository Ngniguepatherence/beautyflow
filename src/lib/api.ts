/**
 * API Service Layer — Abstraction over data access.
 * 
 * Currently uses localStorage. When migrating to a Node.js backend,
 * replace implementations with fetch/axios calls to your REST API.
 * 
 * All methods return Promises for future backend compatibility.
 */

import {
  getSalonAccounts,
  saveSalonAccounts,
  createSalonAccount as createSalonLocal,
  verifySalonLogin as verifySalonLocal,
  isSalonSubscriptionActive as checkSubscription,
  renewSalonSubscription as renewLocal,
  toggleSalonActive as toggleLocal,
  verifyAdmin as verifyAdminLocal,
  getSession as getSessionLocal,
  setSession as setSessionLocal,
  clearSession as clearSessionLocal,
} from '@/lib/auth';
import { getStorageItem, setStorageItem, tenantStorageKey, STORAGE_KEYS } from '@/lib/storage';
import type { SalonAccount, AuthSession } from '@/types/auth';
import type { Client, TypePrestation, Prestation, Produit, Vente, Depense, Salon } from '@/types';

// ===== Base URL for future Node.js backend =====
// When ready, set this to your backend URL e.g. "https://api.leaderbright.com"
export const API_BASE_URL = 'http://localhost:3000/api';

// ===== Auth API =====
export const authApi = {
  verifyAdmin: async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with POST /api/auth/admin/login
    return verifyAdminLocal(email, password);
  },

  verifySalonLogin: async (email: string, password: string): Promise<{ salon: SalonAccount; user: import('@/types/auth').SalonUser } | null> => {
    // TODO: Replace with POST /api/auth/salon/login
    return verifySalonLocal(email, password);
  },

  googleLogin: (): void => {
    const redirectUrl = encodeURIComponent(window.location.origin + '/pro/onboarding');
    window.location.href = `${API_BASE_URL}/auth/google?redirect=${redirectUrl}`;
  },

  googleLoginWithToken: async (token: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Authentication Google échouée');
    }
    return res.json();
  },

  getMe: async (token: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  getSession: (): AuthSession | null => {
    // TODO: Replace with token-based session from backend
    return getSessionLocal();
  },

  setSession: (session: AuthSession): void => {
    // TODO: Replace with storing JWT token
    setSessionLocal(session);
  },

  clearSession: (): void => {
    // TODO: Replace with POST /api/auth/logout
    clearSessionLocal();
  },
};

// ===== Salons API =====
export const salonsApi = {
  getAll: async (): Promise<SalonAccount[]> => {
    // TODO: Replace with GET /api/admin/salons
    return getSalonAccounts();
  },

  create: async (data: Parameters<typeof createSalonLocal>[0]): Promise<SalonAccount> => {
    // TODO: Replace with POST /api/admin/salons
    return createSalonLocal(data);
  },

  renew: async (salonId: string): Promise<void> => {
    // TODO: Replace with POST /api/admin/salons/:id/renew
    renewLocal(salonId);
  },

  toggleActive: async (salonId: string, active: boolean): Promise<void> => {
    // TODO: Replace with PATCH /api/admin/salons/:id/active
    toggleLocal(salonId, active);
  },

  isSubscriptionActive: (salon: SalonAccount): boolean => {
    // TODO: Replace with GET /api/salons/:id/subscription
    return checkSubscription(salon);
  },

  onboard: async (form: any, token: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/salons/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Erreur lors de la création du salon');
    }
    return res.json();
  },

  update: async (salonId: string, form: any, token: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/salons/${salonId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Erreur lors de la mise à jour du salon');
    }
    return res.json();
  },

  link: async (identifier: string, token: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/salons/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ identifier })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Erreur lors de la liaison du salon');
    }
    return res.json();
  },

  addStaff: async (salonId: string, staff: any, token: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/salons/${salonId}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(staff)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Erreur lors de l’ajout du collaborateur');
    }
    return res.json();
  },
};

// ===== Payments API =====
export const paymentsApi = {
  subscribe: async (salonId: string, plan: string, token: string) => {
    const res = await fetch(`${API_BASE_URL}/payments/subscribe/${salonId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ plan })
    });
    if (!res.ok) throw new Error('Failed to initiate payment');
    return res.json();
  }
};

// ===== Tenant Data API =====
// Generic tenant data access — scoped per salon
export function createTenantApi<T>(storageKey: string) {
  return {
    getAll: async (salonId: string | undefined, defaultValue: T[]): Promise<T[]> => {
      // TODO: Replace with GET /api/salons/:salonId/{resource}
      const key = tenantStorageKey(salonId, storageKey);
      return getStorageItem(key, defaultValue);
    },

    save: async (salonId: string | undefined, data: T[]): Promise<void> => {
      // TODO: Replace with PUT /api/salons/:salonId/{resource}
      const key = tenantStorageKey(salonId, storageKey);
      setStorageItem(key, data);
    },
  };
}

// Pre-configured tenant APIs
export const clientsApi = createTenantApi<Client>(STORAGE_KEYS.CLIENTS);
export const prestationsApi = createTenantApi<Prestation>(STORAGE_KEYS.PRESTATIONS);
export const typesPrestationsApi = createTenantApi<TypePrestation>(STORAGE_KEYS.TYPES_PRESTATIONS);
export const produitsApi = createTenantApi<Produit>(STORAGE_KEYS.PRODUITS);
export const ventesApi = createTenantApi<Vente>(STORAGE_KEYS.VENTES);
export const depensesApi = createTenantApi<Depense>(STORAGE_KEYS.DEPENSES);

// ===== Marketplace API =====
export const marketplaceApi = {
  getSalons: async () => {
    const res = await fetch(`${API_BASE_URL}/marketplace/salons`);
    if (!res.ok) throw new Error('Failed to fetch salons');
    return res.json();
  },
  getSalonBySlug: async (slug: string) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/salons/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch salon details');
    return res.json();
  },
  register: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  login: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  getMe: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  getSalonAppointments: async (slug: string, date: string) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/salons/${slug}/appointments?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch salon appointments');
    return res.json();
  },
  createBooking: async (token: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  updateProfile: async (token: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  toggleFavorite: async (token: string, salonId: string) => {
    const res = await fetch(`${API_BASE_URL}/marketplace/auth/favorites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ salonId }),
    });
    return res.json();
  },
  googleLogin: (redirectUrlPath: string = '/explorer/login'): void => {
    const redirectUrl = encodeURIComponent(window.location.origin + redirectUrlPath);
    window.location.href = `${API_BASE_URL}/marketplace/auth/google?redirect=${redirectUrl}`;
  }
};
