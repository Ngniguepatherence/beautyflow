import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Sparkles, PartyPopper, Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import celebrationImg from '@/assets/celebration.jpg';

interface MessageTemplate {
  id: string;
  title: string;
  icon: React.ReactNode;
  message: string;
  color: string;
}

interface MessageTemplatesProps {
  salonName: string;
  onSelectTemplate: (message: string) => void;
}

export function MessageTemplates({ salonName, onSelectTemplate }: MessageTemplatesProps) {
  const templates: MessageTemplate[] = [
    {
      id: 'promo',
      title: 'Promotion',
      icon: <Gift className="h-5 w-5" />,
      color: 'bg-primary/20 text-primary',
      message: `🎉 Offre spéciale !

Bonjour {nom},

Profitez de -20% sur toutes nos prestations cette semaine !

Prenez rendez-vous vite ! 💇‍♀️

${salonName}`,
    },
    {
      id: 'nouveaute',
      title: 'Nouveauté',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'bg-accent/20 text-accent',
      message: `✨ Nouveauté au salon !

Bonjour {nom},

Nous sommes ravis de vous annoncer l'arrivée de nouvelles prestations !

Venez découvrir nos nouveautés. 🌟

${salonName}`,
    },
    {
      id: 'fetes',
      title: 'Fêtes',
      icon: <PartyPopper className="h-5 w-5" />,
      color: 'bg-warning/20 text-warning',
      message: `🎄 Joyeuses fêtes !

Chère {nom},

Toute l'équipe vous souhaite de merveilleuses fêtes de fin d'année !

À très bientôt au salon ! 💕

${salonName}`,
    },
    {
      id: 'merci',
      title: 'Remerciement',
      icon: <Heart className="h-5 w-5" />,
      color: 'bg-destructive/20 text-destructive',
      message: `💖 Merci de votre fidélité !

Chère {nom},

Nous tenons à vous remercier pour votre confiance continue.

C'est grâce à des clientes comme vous que notre salon brille chaque jour !

À très bientôt ! ✨

${salonName}`,
    },
    {
      id: 'rappel',
      title: 'Rappel RDV',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-info/20 text-info',
      message: `📅 Rappel de rendez-vous

Bonjour {nom},

N'oubliez pas votre rendez-vous au salon !

Nous vous attendons avec impatience. 😊

${salonName}`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with image */}
      <div className="relative h-32 rounded-xl overflow-hidden mb-4">
        <img 
          src={celebrationImg} 
          alt="Célébration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center p-4">
          <div className="text-white">
            <h3 className="font-bold text-lg">Modèles prêts</h3>
            <p className="text-sm opacity-90">Cliquez pour utiliser</p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
            onClick={() => onSelectTemplate(template.message)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", template.color)}>
                  {template.icon}
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">
                  {template.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.message.substring(0, 80)}...
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
