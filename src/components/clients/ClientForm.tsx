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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client, ClientStatus } from '@/types';

const clientSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  telephone: z.string().min(9, 'Numéro de téléphone invalide'),
  dateAnniversaire: z.string().optional(),
  statut: z.enum(['nouvelle', 'reguliere', 'vip']),
  notes: z.string().optional(),
  parrainId: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client;
  clients?: Client[];
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
}

export function ClientForm({ client, clients = [], onSubmit, onCancel }: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nom: client?.nom || '',
      telephone: client?.telephone || '',
      dateAnniversaire: client?.dateAnniversaire || '',
      statut: client?.statut || 'nouvelle',
      notes: client?.notes || '',
      parrainId: client?.parrainId || '',
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
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Marie Nguema" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone (WhatsApp)</FormLabel>
              <FormControl>
                <Input placeholder="+237 6XX XXX XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateAnniversaire"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d'anniversaire (optionnel)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="statut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="nouvelle">Nouvelle</SelectItem>
                  <SelectItem value="reguliere">Régulière</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parrainId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parrainée par (optionnel)</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une marraine" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                {clients.filter(c => c.id !== client?.id).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nom} ({c.telephone})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (optionnel)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Préférences, allergies, remarques..."
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
          {client ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  </Form>
  );
}
