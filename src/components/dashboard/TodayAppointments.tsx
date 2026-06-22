import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RendezVous } from '@/types/rendez-vous';
import { Client, TypePrestation } from '@/types';

interface TodayAppointmentsProps {
  rendezVous: RendezVous[];
  clients: Client[];
  typesPrestations: TypePrestation[];
}

const statutColors: Record<string, string> = {
  confirme: 'bg-success/20 text-success',
  en_attente: 'bg-warning/20 text-warning',
  annule: 'bg-destructive/20 text-destructive',
  termine: 'bg-muted text-muted-foreground',
};

const statutLabels: Record<string, string> = {
  confirme: 'Confirmé',
  en_attente: 'En attente',
  annule: 'Annulé',
  termine: 'Terminé',
};

export function TodayAppointments({ rendezVous, clients, typesPrestations }: TodayAppointmentsProps) {
  return (
    <Card className="card-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Rendez-vous du jour
        </CardTitle>
        <Link to="/rendez-vous">
          <Button variant="ghost" size="sm">
            Voir tout <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {rendezVous.length > 0 ? (
          <div className="space-y-3">
            {rendezVous.slice(0, 5).map(rdv => {
              const client = clients.find(c => c.id === rdv.clientId);
              const type = typesPrestations.find(t => t.id === rdv.typePrestationId);
              return (
                <div key={rdv.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg px-3 py-2 shrink-0">
                    <Clock className="h-4 w-4 text-primary mb-0.5" />
                    <span className="text-sm font-bold text-primary">{rdv.heure}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{client?.nom || 'Cliente'}</p>
                    <p className="text-xs text-muted-foreground truncate">{type?.nom || 'Prestation'}</p>
                  </div>
                  <Badge className={`shrink-0 border-0 ${statutColors[rdv.statut] || ''}`}>
                    {statutLabels[rdv.statut] || rdv.statut}
                  </Badge>
                </div>
              );
            })}
            {rendezVous.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">+{rendezVous.length - 5} autres</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aucun rendez-vous aujourd'hui</p>
            <Link to="/rendez-vous">
              <Button variant="link" size="sm" className="mt-2">Planifier un RDV</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
