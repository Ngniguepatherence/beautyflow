import { useState, useCallback, useEffect } from 'react';
import { RendezVous } from '@/types/rendez-vous';
import { getStorageItem, setStorageItem, tenantStorageKey, STORAGE_KEYS } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

const mockRendezVous: RendezVous[] = [];

export function useRendezVous() {
  const { session } = useAuth();
  const salonId = session?.salonId;
  const key = tenantStorageKey(salonId, STORAGE_KEYS.RENDEZ_VOUS);

  const [rendezVous, setRendezVous] = useState<RendezVous[]>(() => getStorageItem(key, mockRendezVous));

  useEffect(() => { setStorageItem(key, rendezVous); }, [rendezVous, key]);
  useEffect(() => { setRendezVous(getStorageItem(key, mockRendezVous)); }, [key]);

  const addRendezVous = useCallback((rdv: Omit<RendezVous, 'id'>) => {
    const newRdv: RendezVous = { ...rdv, id: crypto.randomUUID() };
    setRendezVous(prev => [...prev, newRdv]);
    return newRdv;
  }, []);

  const updateRendezVous = useCallback((id: string, updates: Partial<RendezVous>) => {
    setRendezVous(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRendezVous = useCallback((id: string) => {
    setRendezVous(prev => prev.filter(r => r.id !== id));
  }, []);

  const getRendezVousByDate = useCallback((date: string) => {
    return rendezVous.filter(r => r.date === date).sort((a, b) => a.heure.localeCompare(b.heure));
  }, [rendezVous]);

  const getRendezVousAujourdhui = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return getRendezVousByDate(today);
  }, [getRendezVousByDate]);

  const getDatesAvecRendezVous = useCallback(() => {
    return Array.from(new Set(rendezVous.map(r => r.date)));
  }, [rendezVous]);

  return { rendezVous, addRendezVous, updateRendezVous, deleteRendezVous, getRendezVousByDate, getRendezVousAujourdhui, getDatesAvecRendezVous };
}
