import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useStock } from '@/hooks/useStock';
import { useRendezVous } from '@/hooks/useRendezVous';
import { useClients } from '@/hooks/useClients';
import { useSalon } from '@/hooks/useSalon';

export interface AppNotification {
  id: string;
  type: 'stock' | 'rdv' | 'inactive' | 'info';
  title: string;
  description: string;
  read: boolean;
  timestamp: number;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  stockAlertCount: number;
  rdvTodayCount: number;
  inactiveCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { produitsEnAlerte } = useStock();
  const { getRendezVousAujourdhui } = useRendezVous();
  const { getInactiveClients } = useClients();
  const { salon } = useSalon();

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const rdvToday = getRendezVousAujourdhui();
  const inactiveClients = getInactiveClients(salon.joursRappelInactivite);

  const notifications = useMemo(() => {
    const notifs: AppNotification[] = [];

    // Stock alerts
    produitsEnAlerte.forEach(p => {
      const id = `stock-${p.id}`;
      if (!dismissedIds.has(id)) {
        notifs.push({
          id,
          type: 'stock',
          title: p.nom,
          description: `${p.quantite}/${p.seuilAlerte}`,
          read: readIds.has(id),
          timestamp: Date.now(),
        });
      }
    });

    // Today's RDV
    if (rdvToday.length > 0) {
      const id = `rdv-today`;
      if (!dismissedIds.has(id)) {
        notifs.push({
          id,
          type: 'rdv',
          title: `${rdvToday.length}`,
          description: 'today',
          read: readIds.has(id),
          timestamp: Date.now(),
        });
      }
    }

    // Inactive clients
    if (inactiveClients.length > 0) {
      const id = `inactive-clients`;
      if (!dismissedIds.has(id)) {
        notifs.push({
          id,
          type: 'inactive',
          title: `${inactiveClients.length}`,
          description: `${salon.joursRappelInactivite}`,
          read: readIds.has(id),
          timestamp: Date.now(),
        });
      }
    }

    return notifs;
  }, [produitsEnAlerte, rdvToday, inactiveClients, dismissedIds, readIds, salon.joursRappelInactivite]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => new Set([...prev, id]));
  }, []);

  const clearAll = useCallback(() => {
    setDismissedIds(prev => new Set([...prev, ...notifications.map(n => n.id)]));
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      clearAll,
      stockAlertCount: produitsEnAlerte.length,
      rdvTodayCount: rdvToday.length,
      inactiveCount: inactiveClients.length,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
