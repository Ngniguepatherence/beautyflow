// Utilitaires de stockage localStorage

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erreur de stockage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erreur de suppression:', error);
  }
}

// Clé de stockage avec isolation par tenant
export function tenantStorageKey(salonId: string | undefined, key: string): string {
  if (!salonId) return key; // fallback
  return `bf_${salonId}_${key}`;
}

// Clés de stockage de base (utilisées avec tenantStorageKey)
export const STORAGE_KEYS = {
  CLIENTS: 'clients',
  PRESTATIONS: 'prestations',
  TYPES_PRESTATIONS: 'types_prestations',
  RAPPELS: 'rappels',
  SALON: 'salon',
  UTILISATEUR: 'utilisateur',
  AUTH: 'auth',
  PRODUITS: 'produits',
  VENTES: 'ventes',
  DEPENSES: 'depenses',
  RENDEZ_VOUS: 'rendez_vous',
} as const;
