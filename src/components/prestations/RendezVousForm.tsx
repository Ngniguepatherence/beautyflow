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
import { usePrestations } from '@/hooks/usePrestations';
import { useClients } from '@/hooks/useClients';

const rdvSchema = z.object({
  clientId: z.string().min(1, 'Veuillez sélectionner une cliente'),
  typePrestationId: z.string().min(1, 'Veuillez sélectionner une prestation'),
  date: z.string().min(1, 'Veuillez sélectionner une date'),
  heure: z.string().min(1, 'Veuillez sélectionner une heure'),
  duree: z.coerce.number().min(15, 'Durée minimale: 15 min'),
  employe: z.string().optional(),
  notes: z.string().optional(),
});

export type RdvFormData = z.infer<typeof rdvSchema>;

interface RendezVousFormProps {
  defaultDate?: string;
  onSubmit: (data: RdvFormData) => void;
  onCancel: () => void;
}

export function RendezVousForm({ defaultDate, onSubmit, onCancel }: RendezVousFormProps) {
  const { typesPrestations } = usePrestations();
  const { clients } = useClients();

  const form = useForm<RdvFormData>({
    resolver: zodResolver(rdvSchema),
    defaultValues: {
      clientId: '',
      typePrestationId: '',
      date: defaultDate || new Date().toISOString().split('T')[0],
      heure: '09:00',
      duree: 60,
      employe: '',
      notes: '',
    },
  });

  const heures = [];
  for (let h = 8; h <= 19; h++) {
    heures.push(`${h.toString().padStart(2, '0')}:00`);
    heures.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom} - {client.telephone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="typePrestationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prestation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une prestation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typesPrestations.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.nom} - {type.prix.toLocaleString()} FCFA
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {heures.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="duree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée (minutes)</FormLabel>
              <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1h</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2h</SelectItem>
                  <SelectItem value="180">3h</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employé(e) (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'employé(e)" {...field} />
              </FormControl>
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
                  placeholder="Remarques sur le rendez-vous..."
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
            Planifier
          </Button>
        </div>
      </form>
    </Form>
  );
}
