import React from 'react';
import { Phone, Calendar, Star, Gift, TrendingUp, MessageSquare } from 'lucide-react';
import { Client } from '@/types';
import { usePrestations } from '@/hooks/usePrestations';
import { useSalon } from '@/hooks/useSalon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ClientDetailProps {
  client: Client;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function ClientDetail({ client }: ClientDetailProps) {
  const { getPrestationsClient, getTypePrestation } = usePrestations();
  const { salon } = useSalon();
  const prestations = getPrestationsClient(client.id);

  const progressFidelite = Math.min(
    (client.pointsFidelite % salon.configFidelite.visitesRequises) / 
    salon.configFidelite.visitesRequises * 100,
    100
  );

  const reductionsGagnees = Math.floor(client.pointsFidelite / salon.configFidelite.visitesRequises);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour ${client.nom}, nous espérons que vous allez bien ! Nous serions ravis de vous revoir bientôt au salon. 💇‍♀️✨`
    );
    const phone = client.telephone.replace(/\s/g, '').replace('+', '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-2xl">
            {client.nom.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">{client.nom}</h2>
            {client.statut === 'vip' && (
              <Badge className="bg-accent/20 text-accent">
                <Star className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Phone className="h-4 w-4" />
            <span>{client.telephone}</span>
          </div>
        </div>
        <Button onClick={handleWhatsApp} className="gradient-primary">
          <MessageSquare className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-muted/50">
          <p className="text-sm text-muted-foreground">Visites</p>
          <p className="text-2xl font-bold text-foreground">{client.nombreVisites}</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <p className="text-sm text-muted-foreground">Total dépensé</p>
          <p className="text-xl font-bold text-foreground">{formatCurrency(client.totalDepense)}</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <p className="text-sm text-muted-foreground">Points fidélité</p>
          <p className="text-2xl font-bold text-primary">{client.pointsFidelite}</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50">
          <p className="text-sm text-muted-foreground">Réductions gagnées</p>
          <p className="text-2xl font-bold text-accent">{reductionsGagnees}</p>
        </div>
      </div>

      {/* Fidélité Progress */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <span className="font-medium">Progression fidélité</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {client.pointsFidelite % salon.configFidelite.visitesRequises} / {salon.configFidelite.visitesRequises} visites
          </span>
        </div>
        <Progress value={progressFidelite} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          Encore {salon.configFidelite.visitesRequises - (client.pointsFidelite % salon.configFidelite.visitesRequises)} visite(s) 
          pour obtenir {salon.configFidelite.reductionPourcentage}% de réduction
        </p>
      </div>

      {/* Informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border">
          <h3 className="font-medium mb-3">Informations</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inscrite le</span>
              <span>{new Date(client.dateInscription).toLocaleDateString('fr-FR')}</span>
            </div>
            {client.dateAnniversaire && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anniversaire</span>
                <span>{new Date(client.dateAnniversaire).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière visite</span>
              <span>
                {client.derniereVisite 
                  ? new Date(client.derniereVisite).toLocaleDateString('fr-FR')
                  : 'Aucune'}
              </span>
            </div>
          </div>
        </div>
        
        {client.notes && (
          <div className="p-4 rounded-xl border border-border">
            <h3 className="font-medium mb-3">Notes</h3>
            <p className="text-sm text-muted-foreground">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Historique */}
      <div>
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Historique des prestations
        </h3>
        {prestations.length > 0 ? (
          <div className="space-y-2">
            {prestations.map((prestation) => {
              const type = getTypePrestation(prestation.typePrestationId);
              return (
                <div key={prestation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{type?.nom || 'Prestation inconnue'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(prestation.date).toLocaleDateString('fr-FR')}
                      {prestation.employe && ` • Par ${prestation.employe}`}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(prestation.montant)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">Aucune prestation enregistrée</p>
        )}
      </div>
    </div>
  );
}
