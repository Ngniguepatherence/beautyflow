import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TypePrestation } from '@/types';

const typeSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prix: z.coerce.number().min(0, 'Le prix doit être positif'),
  description: z.string().optional(),
  categorie: z.string().optional(),
});

type TypeFormData = z.infer<typeof typeSchema>;

interface TypePrestationFormProps {
  type?: TypePrestation;
  onSubmit: (data: TypeFormData) => void;
  onCancel: () => void;
}

export function TypePrestationForm({ type, onSubmit, onCancel }: TypePrestationFormProps) {
  const form = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      nom: type?.nom || '',
      prix: type?.prix || 0,
      description: type?.description || '',
      categorie: type?.categorie || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la prestation</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tresses africaines" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix (FCFA)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="15000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categorie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Coiffure, Ongles, Maquillage..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description de la prestation..."
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" className="flex-1 gradient-primary">
            {type ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
