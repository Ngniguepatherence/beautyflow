import { useState, useCallback, useEffect, useMemo } from 'react';
import { Vente, VenteItem, Depense } from '@/types';
import { getStorageItem, setStorageItem, tenantStorageKey, STORAGE_KEYS } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

const mockVentes: Vente[] = [];
const mockDepenses: Depense[] = [];

export function useFinances() {
  const { session } = useAuth();
  const salonId = session?.salonId;
  const ventesKey = tenantStorageKey(salonId, STORAGE_KEYS.VENTES);
  const depensesKey = tenantStorageKey(salonId, STORAGE_KEYS.DEPENSES);

  const [ventes, setVentes] = useState<Vente[]>(() => getStorageItem(ventesKey, mockVentes));
  const [depenses, setDepenses] = useState<Depense[]>(() => getStorageItem(depensesKey, mockDepenses));

  useEffect(() => { setStorageItem(ventesKey, ventes); }, [ventes, ventesKey]);
  useEffect(() => { setStorageItem(depensesKey, depenses); }, [depenses, depensesKey]);
  useEffect(() => {
    setVentes(getStorageItem(ventesKey, mockVentes));
    setDepenses(getStorageItem(depensesKey, mockDepenses));
  }, [ventesKey, depensesKey]);

  const addVente = useCallback((vente: Omit<Vente, 'id'>) => {
    const newVente: Vente = { ...vente, id: crypto.randomUUID() };
    setVentes(prev => [...prev, newVente]);
    return newVente;
  }, []);

  const addDepense = useCallback((depense: Omit<Depense, 'id'>) => {
    const newDepense: Depense = { ...depense, id: crypto.randomUUID() };
    setDepenses(prev => [...prev, newDepense]);
    return newDepense;
  }, []);

  const deleteVente = useCallback((id: string) => { setVentes(prev => prev.filter(v => v.id !== id)); }, []);
  const deleteDepense = useCallback((id: string) => { setDepenses(prev => prev.filter(d => d.id !== id)); }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const ventesMois = ventes.filter(v => v.date.startsWith(thisMonth));
    const depensesMois = depenses.filter(d => d.date.startsWith(thisMonth));
    const totalRevenus = ventesMois.reduce((s, v) => s + v.totalMontant, 0);
    const totalDepenses = depensesMois.reduce((s, d) => s + d.montant, 0);
    const benefice = totalRevenus - totalDepenses;
    const revenusProduits = ventesMois.reduce((s, v) => s + v.items.filter(i => i.type === 'produit').reduce((si, i) => si + i.montant, 0), 0);
    const revenusPrestations = ventesMois.reduce((s, v) => s + v.items.filter(i => i.type === 'prestation').reduce((si, i) => si + i.montant, 0), 0);
    const parModePaiement: Record<string, number> = {};
    ventesMois.forEach(v => { parModePaiement[v.modePaiement] = (parModePaiement[v.modePaiement] || 0) + v.totalMontant; });
    const parCategorieDepense: Record<string, number> = {};
    depensesMois.forEach(d => { parCategorieDepense[d.categorie] = (parCategorieDepense[d.categorie] || 0) + d.montant; });
    return { totalRevenus, totalDepenses, benefice, revenusProduits, revenusPrestations, nombreVentes: ventesMois.length, parModePaiement, parCategorieDepense };
  }, [ventes, depenses]);

  return { ventes, depenses, addVente, addDepense, deleteVente, deleteDepense, stats };
}
