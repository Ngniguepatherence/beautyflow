import { useState, useCallback, useEffect } from 'react';
import { TypePrestation, Prestation } from '@/types';
import { getStorageItem, setStorageItem, tenantStorageKey, STORAGE_KEYS } from '@/lib/storage';
import { defaultTypesPrestations, mockPrestations } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

function mergeDefaultTypes(stored: TypePrestation[], defaults: TypePrestation[]): TypePrestation[] {
  const storedIds = new Set(stored.map(t => t.id));
  const newDefaults = defaults.filter(d => !storedIds.has(d.id));
  return newDefaults.length > 0 ? [...stored, ...newDefaults] : stored;
}

export function usePrestations() {
  const { session } = useAuth();
  const salonId = session?.salonId;
  const typesKey = tenantStorageKey(salonId, STORAGE_KEYS.TYPES_PRESTATIONS);
  const prestKey = tenantStorageKey(salonId, STORAGE_KEYS.PRESTATIONS);

  const [typesPrestations, setTypesPrestations] = useState<TypePrestation[]>(() => {
    const stored = getStorageItem(typesKey, defaultTypesPrestations);
    return mergeDefaultTypes(stored, defaultTypesPrestations);
  });
  const [prestations, setPrestations] = useState<Prestation[]>(() => 
    getStorageItem(prestKey, mockPrestations)
  );

  useEffect(() => { setStorageItem(typesKey, typesPrestations); }, [typesPrestations, typesKey]);
  useEffect(() => { setStorageItem(prestKey, prestations); }, [prestations, prestKey]);
  useEffect(() => {
    setTypesPrestations(mergeDefaultTypes(getStorageItem(typesKey, defaultTypesPrestations), defaultTypesPrestations));
    setPrestations(getStorageItem(prestKey, mockPrestations));
  }, [typesKey, prestKey]);

  const addTypePrestation = useCallback((type: Omit<TypePrestation, 'id'>) => {
    const newType: TypePrestation = { ...type, id: crypto.randomUUID() };
    setTypesPrestations(prev => [...prev, newType]);
    return newType;
  }, []);

  const updateTypePrestation = useCallback((id: string, updates: Partial<TypePrestation>) => {
    setTypesPrestations(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTypePrestation = useCallback((id: string) => {
    setTypesPrestations(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTypePrestation = useCallback((id: string) => {
    return typesPrestations.find(t => t.id === id);
  }, [typesPrestations]);

  const addPrestation = useCallback((prestation: Omit<Prestation, 'id' | 'date'>) => {
    const newPrestation: Prestation = { ...prestation, id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] };
    setPrestations(prev => [...prev, newPrestation]);
    return newPrestation;
  }, []);

  const getPrestationsClient = useCallback((clientId: string) => {
    return prestations.filter(p => p.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [prestations]);

  const getPrestationsCeMois = useCallback(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return prestations.filter(p => new Date(p.date) >= startOfMonth);
  }, [prestations]);

  const getRevenusCeMois = useCallback(() => {
    return getPrestationsCeMois().reduce((sum, p) => sum + p.montant, 0);
  }, [getPrestationsCeMois]);

  const getPrestationsPopulaires = useCallback(() => {
    const counts: Record<string, number> = {};
    prestations.forEach(p => {
      const type = typesPrestations.find(t => t.id === p.typePrestationId);
      if (type) counts[type.nom] = (counts[type.nom] || 0) + 1;
    });
    return Object.entries(counts).map(([nom, count]) => ({ nom, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [prestations, typesPrestations]);

  return { typesPrestations, prestations, addTypePrestation, updateTypePrestation, deleteTypePrestation, getTypePrestation, addPrestation, getPrestationsClient, getPrestationsCeMois, getRevenusCeMois, getPrestationsPopulaires };
}
