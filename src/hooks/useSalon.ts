import { useState, useCallback, useEffect } from 'react';
import { Salon } from '@/types';
import { getStorageItem, setStorageItem, tenantStorageKey, STORAGE_KEYS } from '@/lib/storage';
import { defaultSalon } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

export function useSalon() {
  const { session } = useAuth();
  const salonId = session?.salonId;
  const key = tenantStorageKey(salonId, STORAGE_KEYS.SALON);

  const [salon, setSalon] = useState<Salon>(() => 
    getStorageItem(key, defaultSalon)
  );

  useEffect(() => { setStorageItem(key, salon); }, [salon, key]);
  useEffect(() => { setSalon(getStorageItem(key, defaultSalon)); }, [key]);

  const updateSalon = useCallback((updates: Partial<Salon>) => {
    setSalon(prev => ({ ...prev, ...updates }));
  }, []);

  const updateConfigFidelite = useCallback((updates: Partial<Salon['configFidelite']>) => {
    setSalon(prev => ({
      ...prev,
      configFidelite: { ...prev.configFidelite, ...updates },
    }));
  }, []);

  return { salon, updateSalon, updateConfigFidelite };
}
