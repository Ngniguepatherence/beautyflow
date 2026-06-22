import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, User, Scissors, Plus, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRendezVous } from '@/hooks/useRendezVous';
import { useClients } from '@/hooks/useClients';
import { usePrestations } from '@/hooks/usePrestations';
import { RendezVousForm, RdvFormData } from './RendezVousForm';
import { toast } from '@/hooks/use-toast';

const statutConfig = {
  confirme: { label: 'Confirmé', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  en_attente: { label: 'En attente', icon: AlertCircle, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  annule: { label: 'Annulé', icon: XCircle, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  termine: { label: 'Terminé', icon: CheckCircle2, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
};

export function CalendrierRendezVous() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddRdv, setShowAddRdv] = useState(false);

  const { getRendezVousByDate, getDatesAvecRendezVous, addRendezVous, updateRendezVous, deleteRendezVous } = useRendezVous();
  const { getClient } = useClients();
  const { getTypePrestation } = usePrestations();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const rdvDuJour = getRendezVousByDate(dateStr);
  const datesAvecRdv = getDatesAvecRendezVous();

  const handleAddRdv = (data: RdvFormData) => {
    addRendezVous({
      clientId: data.clientId,
      typePrestationId: data.typePrestationId,
      date: data.date,
      heure: data.heure,
      duree: data.duree,
      employe: data.employe,
      notes: data.notes,
      statut: 'en_attente',
    });
    setShowAddRdv(false);
    toast({
      title: 'Rendez-vous planifié',
      description: `RDV ajouté pour le ${format(new Date(data.date), 'dd MMMM yyyy', { locale: fr })} à ${data.heure}`,
    });
  };

  const handleStatutChange = (id: string, statut: 'confirme' | 'en_attente' | 'annule' | 'termine') => {
    updateRendezVous(id, { statut });
    toast({ title: `Statut mis à jour: ${statutConfig[statut].label}` });
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce rendez-vous ?')) {
      deleteRendezVous(id);
      toast({ title: 'Rendez-vous supprimé' });
    }
  };

  // Highlight dates with appointments
  const modifiers = {
    hasRdv: datesAvecRdv.map(d => new Date(d + 'T00:00:00')),
  };

  const modifiersStyles = {
    hasRdv: {
      position: 'relative' as const,
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="card-shadow lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calendrier</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={fr}
              className="pointer-events-auto"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              modifiersClassNames={{
                hasRdv: 'rdv-dot',
              }}
            />
          </CardContent>
        </Card>

        {/* Day View */}
        <Card className="card-shadow lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE dd MMMM yyyy', { locale: fr })}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {rdvDuJour.length} rendez-vous
              </p>
            </div>
            <Button onClick={() => setShowAddRdv(true)} className="gradient-primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau RDV
            </Button>
          </CardHeader>
          <CardContent>
            {rdvDuJour.length > 0 ? (
              <div className="space-y-3">
                {rdvDuJour.map((rdv) => {
                  const client = getClient(rdv.clientId);
                  const type = getTypePrestation(rdv.typePrestationId);
                  const config = statutConfig[rdv.statut];
                  const StatutIcon = config.icon;

                  return (
                    <div
                      key={rdv.id}
                      className={cn(
                        'p-4 rounded-xl border border-border bg-card transition-all hover:shadow-md',
                        rdv.statut === 'annule' && 'opacity-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex flex-col items-center gap-1 pt-0.5">
                            <span className="text-lg font-bold text-primary">{rdv.heure}</span>
                            <span className="text-xs text-muted-foreground">{rdv.duree} min</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">
                              {type?.nom || 'Prestation'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              <span className="truncate">{client?.nom || 'Cliente'}</span>
                            </div>
                            {rdv.employe && (
                              <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                                <Scissors className="h-3.5 w-3.5" />
                                <span>{rdv.employe}</span>
                              </div>
                            )}
                            {rdv.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {rdv.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={cn('text-xs', config.className)}>
                            <StatutIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <div className="flex gap-1">
                            {rdv.statut === 'en_attente' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-emerald-600"
                                onClick={() => handleStatutChange(rdv.id, 'confirme')}
                              >
                                Confirmer
                              </Button>
                            )}
                            {(rdv.statut === 'confirme' || rdv.statut === 'en_attente') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-blue-600"
                                onClick={() => handleStatutChange(rdv.id, 'termine')}
                              >
                                Terminé
                              </Button>
                            )}
                            {rdv.statut !== 'annule' && rdv.statut !== 'termine' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-destructive"
                                onClick={() => handleStatutChange(rdv.id, 'annule')}
                              >
                                Annuler
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive"
                              onClick={() => handleDelete(rdv.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">Aucun rendez-vous</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cliquez sur "Nouveau RDV" pour planifier
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add RDV Dialog */}
      <Dialog open={showAddRdv} onOpenChange={setShowAddRdv}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
          </DialogHeader>
          <RendezVousForm
            defaultDate={dateStr}
            onSubmit={handleAddRdv}
            onCancel={() => setShowAddRdv(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
