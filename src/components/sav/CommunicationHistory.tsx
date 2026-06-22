import React from 'react';
import { MessageSquare, Phone, Calendar, Star, ArrowRight, Send } from 'lucide-react';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CommunicationEntry {
  id: string;
  clientId: string;
  type: 'whatsapp' | 'appel' | 'visite' | 'rappel';
  date: string;
  message?: string;
  note?: string;
}

interface CommunicationHistoryProps {
  client: Client;
  communications: CommunicationEntry[];
  onSendMessage: (client: Client) => void;
}

const typeConfig = {
  whatsapp: {
    icon: MessageSquare,
    label: 'WhatsApp',
    color: 'bg-success/20 text-success',
  },
  appel: {
    icon: Phone,
    label: 'Appel',
    color: 'bg-info/20 text-info',
  },
  visite: {
    icon: Star,
    label: 'Visite',
    color: 'bg-primary/20 text-primary',
  },
  rappel: {
    icon: Send,
    label: 'Rappel',
    color: 'bg-warning/20 text-warning',
  },
};

export function CommunicationHistory({ client, communications, onSendMessage }: CommunicationHistoryProps) {
  const clientComms = communications
    .filter(c => c.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Historique des communications
        </h3>
        <Button size="sm" onClick={() => onSendMessage(client)} className="gradient-primary">
          <Send className="h-4 w-4 mr-2" />
          Message
        </Button>
      </div>

      {clientComms.length > 0 ? (
        <div className="space-y-3">
          {clientComms.map((comm) => {
            const config = typeConfig[comm.type];
            const Icon = config.icon;
            
            return (
              <div key={comm.id} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", config.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comm.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {comm.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{comm.message}</p>
                  )}
                  {comm.note && (
                    <p className="text-xs text-muted-foreground italic mt-1">Note: {comm.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune communication enregistrée</p>
          <Button 
            variant="link" 
            className="mt-2"
            onClick={() => onSendMessage(client)}
          >
            Envoyer le premier message
          </Button>
        </div>
      )}
    </div>
  );
}
