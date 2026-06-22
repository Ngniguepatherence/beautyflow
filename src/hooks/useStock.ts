import { useState, useCallback, useEffect, useMemo } from 'react';
import { Produit } from '@/types';
import { getStorageItem, setStorageItem, tenantStorageKey, STORAGE_KEYS } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

const defaultProduits: Produit[] = [
  { id: '1', nom: 'Shampoing professionnel', categorie: 'Cheveux', prix: 5000, prixAchat: 3000, quantite: 24, seuilAlerte: 5, unite: 'bouteille', description: 'Shampoing kératine 500ml' },
  { id: '2', nom: 'Après-shampoing', categorie: 'Cheveux', prix: 4500, prixAchat: 2500, quantite: 18, seuilAlerte: 5, unite: 'bouteille' },
  { id: '3', nom: 'Huile de coco', categorie: 'Cheveux', prix: 3000, prixAchat: 1500, quantite: 30, seuilAlerte: 8, unite: 'flacon' },
  { id: '4', nom: 'Crème défrisante', categorie: 'Cheveux', prix: 6000, prixAchat: 3500, quantite: 12, seuilAlerte: 4, unite: 'pot' },
  { id: '5', nom: 'Vernis à ongles', categorie: 'Ongles', prix: 2000, prixAchat: 800, quantite: 45, seuilAlerte: 10, unite: 'flacon' },
  { id: '6', nom: 'Gel UV', categorie: 'Ongles', prix: 8000, prixAchat: 4500, quantite: 8, seuilAlerte: 3, unite: 'pot' },
  { id: '7', nom: 'Fond de teint', categorie: 'Maquillage', prix: 12000, prixAchat: 7000, quantite: 15, seuilAlerte: 3, unite: 'tube' },
  { id: '8', nom: 'Rouge à lèvres', categorie: 'Maquillage', prix: 5000, prixAchat: 2500, quantite: 20, seuilAlerte: 5, unite: 'pièce' },
  { id: '9', nom: 'Huile de massage', categorie: 'Corps', prix: 4000, prixAchat: 2000, quantite: 10, seuilAlerte: 3, unite: 'flacon' },
  { id: '10', nom: 'Gommage corps', categorie: 'Corps', prix: 6000, prixAchat: 3000, quantite: 14, seuilAlerte: 4, unite: 'pot' },
  { id: '11', nom: 'Savon noir Hamam', categorie: 'Corps', prix: 3500, prixAchat: 1800, quantite: 20, seuilAlerte: 5, unite: 'pot' },
  { id: '12', nom: 'Lame de rasoir', categorie: 'Homme', prix: 500, prixAchat: 200, quantite: 100, seuilAlerte: 20, unite: 'pièce' },
];

export function useStock() {
  const { session } = useAuth();
  const salonId = session?.salonId;
  const key = tenantStorageKey(salonId, STORAGE_KEYS.PRODUITS);

  const [produits, setProduits] = useState<Produit[]>(() => getStorageItem(key, defaultProduits));

  useEffect(() => { setStorageItem(key, produits); }, [produits, key]);
  useEffect(() => { setProduits(getStorageItem(key, defaultProduits)); }, [key]);

  const addProduit = useCallback((produit: Omit<Produit, 'id'>) => {
    const newProduit: Produit = { ...produit, id: crypto.randomUUID() };
    setProduits(prev => [...prev, newProduit]);
    return newProduit;
  }, []);

  const updateProduit = useCallback((id: string, updates: Partial<Produit>) => {
    setProduits(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduit = useCallback((id: string) => {
    setProduits(prev => prev.filter(p => p.id !== id));
  }, []);

  const adjustStock = useCallback((id: string, quantiteChange: number) => {
    setProduits(prev => prev.map(p => p.id === id ? { ...p, quantite: Math.max(0, p.quantite + quantiteChange) } : p));
  }, []);

  const produitsEnAlerte = useMemo(() => produits.filter(p => p.quantite <= p.seuilAlerte), [produits]);
  const categories = useMemo(() => [...new Set(produits.map(p => p.categorie))], [produits]);
  const valeurStock = useMemo(() => produits.reduce((sum, p) => sum + p.prixAchat * p.quantite, 0), [produits]);

  return { produits, addProduit, updateProduit, deleteProduit, adjustStock, produitsEnAlerte, categories, valeurStock };
}
