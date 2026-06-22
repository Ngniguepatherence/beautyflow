import React from 'react';
import { Star, ThumbsUp, ThumbsDown, Meh, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Client } from '@/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SatisfactionSurveyProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const ratings = [
  { value: 1, icon: ThumbsDown, label: 'Pas satisfait', color: 'text-destructive' },
  { value: 2, icon: Meh, label: 'Moyen', color: 'text-warning' },
  { value: 3, icon: ThumbsUp, label: 'Satisfait', color: 'text-success' },
];

export function SatisfactionSurvey({ client, isOpen, onClose, onSubmit }: SatisfactionSurveyProps) {
  const [selectedRating, setSelectedRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');

  const handleSubmit = () => {
    if (selectedRating === null) {
      toast({
        title: 'Sélectionnez une note',
        variant: 'destructive',
      });
      return;
    }

    onSubmit(selectedRating, comment);
    setSelectedRating(null);
    setComment('');
    onClose();

    toast({
      title: 'Avis enregistré !',
      description: 'Merci pour votre retour',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Satisfaction cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary font-bold text-2xl">
                {client.nom.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-medium">{client.nom}</p>
            <p className="text-sm text-muted-foreground">Comment s'est passée sa visite ?</p>
          </div>

          {/* Rating Buttons */}
          <div className="flex justify-center gap-4">
            {ratings.map((rating) => {
              const Icon = rating.icon;
              const isSelected = selectedRating === rating.value;
              
              return (
                <button
                  key={rating.value}
                  onClick={() => setSelectedRating(rating.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    isSelected 
                      ? "border-primary bg-primary/10 scale-105" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className={cn("h-8 w-8", rating.color)} />
                  <span className="text-xs font-medium">{rating.label}</span>
                </button>
              );
            })}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Commentaire (optionnel)
            </label>
            <Textarea
              placeholder="Notes sur la visite..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleSubmit} className="flex-1 gradient-primary">
              <MessageCircle className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
