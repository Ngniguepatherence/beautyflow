import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CampaignMessagePreviewProps {
  client: Client;
  message: string;
  index: number;
  onSent: (clientId: string) => void;
  isSent: boolean;
  delay: number;
}

export function CampaignMessagePreview({ 
  client, 
  message, 
  index, 
  onSent, 
  isSent,
  delay 
}: CampaignMessagePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(index === 0);

  // Simulate delay between messages
  React.useEffect(() => {
    if (index > 0 && !isSent) {
      const timer = setTimeout(() => setIsReady(true), delay * index);
      return () => clearTimeout(timer);
    }
  }, [index, delay, isSent]);

  const formattedMessage = message.replace('{nom}', client.nom);
  const phone = client.telephone.replace(/\s/g, '').replace('+', '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedMessage);
    setCopied(true);
    toast({
      title: 'Message copié !',
      description: 'Collez-le dans WhatsApp',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    // Open WhatsApp with just the phone number - user pastes message manually
    // This approach is less likely to be flagged as spam
    window.open(`https://wa.me/${phone}`, '_blank');
    onSent(client.id);
    toast({
      title: 'WhatsApp ouvert',
      description: `Collez le message pour ${client.nom}`,
    });
  };

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all duration-300",
      isSent 
        ? "border-success/50 bg-success/5" 
        : isReady 
          ? "border-primary/30 bg-card" 
          : "border-border bg-muted/30 opacity-60"
    )}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
          isSent ? "bg-success/20" : "bg-primary/20"
        )}>
          {isSent ? (
            <Check className="h-5 w-5 text-success" />
          ) : (
            <span className="text-primary font-semibold">
              {client.nom.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-foreground">{client.nom}</p>
            {!isReady && !isSent && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                En attente
              </span>
            )}
            {isSent && (
              <span className="text-xs text-success flex items-center gap-1">
                <Check className="h-3 w-3" />
                Envoyé
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{client.telephone}</p>
          
          {/* Message Preview */}
          <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
            {formattedMessage}
          </div>
        </div>
      </div>

      {/* Actions */}
      {isReady && !isSent && (
        <div className="flex gap-2 mt-4 ml-13">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-success" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copier le message
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="flex-1 gradient-primary"
            onClick={handleSendWhatsApp}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
}
