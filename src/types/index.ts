// Types pour LeaderBright BeautyFlow

export type ClientStatus = 'nouvelle' | 'reguliere' | 'vip';

export interface Client {
  id: string;
  nom: string;
  telephone: string;
  dateInscription: string;
  dateAnniversaire?: string;
  statut: ClientStatus;
  notes?: string;
  pointsFidelite: number;
  totalDepense: number;
  nombreVisites: number;
  derniereVisite?: string;
  parrainId?: string;
  filleuls?: string[];
}

// Produits & Stock
export interface Produit {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  prixAchat: number;
  quantite: number;
  seuilAlerte: number;
  description?: string;
  unite: string;
}

// Ventes
export interface Vente {
  id: string;
  date: string;
  clientId?: string;
  items: VenteItem[];
  totalMontant: number;
  modePaiement: 'especes' | 'mobile_money' | 'carte' | 'mixte';
  notes?: string;
}

export interface VenteItem {
  type: 'produit' | 'prestation';
  referenceId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

// Dépenses
export interface Depense {
  id: string;
  date: string;
  categorie: string;
  description: string;
  montant: number;
}

export interface TypePrestation {
  id: string;
  nom: string;
  prix: number;
  description?: string;
  categorie?: string;
}

export interface Prestation {
  id: string;
  clientId: string;
  typePrestationId: string;
  date: string;
  employe?: string;
  notes?: string;
  montant: number;
}

export interface Rappel {
  id: string;
  clientId: string;
  type: 'inactivite' | 'suivi' | 'anniversaire' | 'personnalise';
  dateCreation: string;
  dateEnvoi?: string;
  message: string;
  statut: 'en_attente' | 'envoye' | 'annule';
}

export interface ConfigFidelite {
  visitesRequises: number;
  reductionPourcentage: number;
  visitesVIP: number;
}

export interface Salon {
  id: string;
  nom: string;
  logo?: string;
  telephone: string;
  adresse?: string;
  configFidelite: ConfigFidelite;
  joursRappelInactivite: number;
  joursRappelSuivi: number;
}

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  role: 'admin' | 'employe';
  salonId: string;
}

export interface StatistiquesDashboard {
  totalClientes: number;
  clientesActives: number;
  clientesInactives: number;
  visitesCeMois: number;
  revenusCeMois: number;
  prestationsPopulaires: { nom: string; count: number }[];
}
