import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { z } from 'zod';
import { ArrowLeft, Check, ChevronRight, Clock, Sun, Sunset, Moon, CalendarDays, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { BrandedShell } from '@/components/booking/BrandedShell';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { marketplaceApi } from '@/lib/api';
import {
  makeReference, buildTimeSlots, isSlotTaken,
} from '@/lib/booking';
import type { TypePrestation } from '@/types';
import type { SalonStaff } from '@/types/auth';

type Step = 1 | 2 | 3 | 4 | 5;

const customerSchema = z.object({
  fullName: z.string().trim().min(2, 'Nom requis').max(80),
  phone: z.string().trim().min(8, 'Téléphone invalide').max(20),
  email: z.string().trim().email('Email invalide').max(120).optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
});

export default function PublicBookingFlow() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [salon, setSalon] = useState<any>(null);
  const [services, setServices] = useState<TypePrestation[]>([]);
  const [loadingSalon, setLoadingSalon] = useState(true);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (slug) {
      marketplaceApi.getSalonBySlug(slug).then((res) => {
        if (res.success) {
          setSalon(res.data);
          setServices(res.data.prestations || []);
          
          // Preselect service if passed in URL
          const preselectedId = searchParams.get('serviceId');
          if (preselectedId && res.data.prestations) {
            const found = res.data.prestations.find((p: any) => (p._id || p.id) === preselectedId);
            if (found) {
              setService(found);
              const hasStaff = (res.data.branding?.staff || res.data.staff || []).length > 0;
              setStep(hasStaff ? 2 : 3);
            }
          }
        } else {
          navigate('/booking/not-found', { replace: true });
        }
      }).catch(() => {
        navigate('/booking/not-found', { replace: true });
      }).finally(() => {
        setLoadingSalon(false);
      });
    }
  }, [slug, navigate, searchParams]);

  const settings = salon?.bookingSettings || { openingHour: 9, closingHour: 19, slotDurationMin: 30, autoConfirm: true, closedDays: [0] };
  const staffList: SalonStaff[] = salon?.branding?.staff || [];
  const slots = useMemo(
    () => buildTimeSlots(settings.openingHour, settings.closingHour, settings.slotDurationMin),
    [settings],
  );

  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<TypePrestation | null>(null);
  const [staff, setStaff] = useState<SalonStaff | null>(null);
  const [noPref, setNoPref] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill from logged-in client account
  const { client, token, update } = useClientAuth();
  useEffect(() => {
    if (client) {
      setForm(f => ({
        ...f,
        fullName: f.fullName || client.nom,
        email: f.email || client.email || '',
        phone: f.phone || client.telephone || '',
      }));
    }
  }, [client]);

  const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const existing = [] as any[]; // TODO: Fetch existing rendez-vous to disable slots

  const totalSteps = 5;
  const next = () => setStep(s => Math.min(totalSteps, (s + 1)) as Step);
  const back = () => (step === 1 ? navigate(`/booking/${slug}`) : setStep(s => (s - 1) as Step));

  // Skip staff step if no staff configured
  useEffect(() => {
    if (step === 2 && staffList.length === 0) setStep(3);
  }, [step, staffList.length]);

  const handleSubmit = async () => {
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    if (!service || !date || !time) return;

    setIsSubmitting(true);
    try {
      const reqData = {
        salonId: salon._id || salon.id,
        typePrestationId: service._id || service.id,
        date: dateStr,
        heure: time,
        telephoneClient: parsed.data.phone,
        nomClient: parsed.data.fullName,
        notes: parsed.data.notes
      };

      const reference = makeReference();
      let res;
      if (token) {
        res = await marketplaceApi.createBooking(token, reqData);
      } else {
        // Option 1: Must be logged in to book
        // Option 2: Guest checkout (need a different API endpoint or logic for that)
        // For now, let's assume token is required, we can redirect to login if no token.
        if (!token) {
          navigate(`/explorer/login?redirect=/booking/${slug}/book`);
          return;
        }
      }

      if (res?.success) {
        if (client) {
          update({
            visits: [...(client.visits || []), {
              salonId: salon._id || salon.id,
              salonSlug: slug,
              salonNom: salon.nom || salon.name,
              visitedAt: new Date(`${dateStr}T${time}:00`).toISOString()
            }]
          });
        }
        navigate(`/booking/${slug}/confirmation/${reference}`, {
          state: { service: service.nom, date: dateStr, time, salon: salon.nom || salon.name, staff: staff?.nom },
        });
      } else {
        setErrors({ submit: res?.message || 'Erreur lors de la réservation' });
      }
    } catch (e: any) {
      setErrors({ submit: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = staffList.length > 0
    ? ['Prestation', 'Intervenant·e', 'Date & heure', 'Vos informations', 'Confirmation']
    : ['Prestation', 'Date & heure', 'Vos informations', 'Confirmation'];
  // Map current step (1..5) to label index when no staff
  const labelIndex = staffList.length > 0 ? step - 1 : (step === 1 ? 0 : step - 2);
  const stepTitle = stepTitles[Math.max(0, Math.min(stepTitles.length - 1, labelIndex))];

  // Group services by category for easier scanning
  const servicesByCategory = useMemo(() => {
    const groups = new Map<string, TypePrestation[]>();
    for (const s of services) {
      const cat = s.categorie || 'Prestations';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(s);
    }
    return Array.from(groups.entries());
  }, [services]);

  // Group time slots by period
  const slotGroups = useMemo(() => {
    const morning: string[] = [], afternoon: string[] = [], evening: string[] = [];
    for (const t of slots) {
      const h = parseInt(t.split(':')[0], 10);
      if (h < 12) morning.push(t);
      else if (h < 17) afternoon.push(t);
      else evening.push(t);
    }
    return [
      { label: 'Matin', icon: Sun, items: morning },
      { label: 'Après-midi', icon: Sunset, items: afternoon },
      { label: 'Soirée', icon: Moon, items: evening },
    ].filter(g => g.items.length > 0);
  }, [slots]);

  if (loadingSalon) return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  if (!salon) return <Navigate to="/booking/not-found" replace />;

  return (
    <BrandedShell salon={salon}>
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-32 md:pb-12">
        <div className="md:grid md:grid-cols-12 md:gap-8 md:items-start">
          
          {/* Left Column: Flow */}
          <div className="md:col-span-7 lg:col-span-8">
            {/* Step header */}
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={back} className="h-10 w-10 -ml-2 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                  Étape {labelIndex + 1} sur {stepTitles.length}
                </div>
                <h1 className="text-xl md:text-2xl font-bold leading-tight">{stepTitle}</h1>
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-1.5 mb-5">
              {Array.from({ length: stepTitles.length }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all ${idx <= labelIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                />
              ))}
            </div>

            {/* Mobile Persistent selection summary (hidden on desktop) */}
            <div className="block md:hidden">

        {/* Persistent selection summary (steps 2+) */}
        {step > 1 && service && (
          <button
            onClick={() => setStep(1)}
            className="w-full mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-left hover:bg-primary/10 transition-colors"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{service.nom}</div>
              <div className="text-xs text-muted-foreground">
                {service.prix.toLocaleString('fr-FR')} FCFA · {settings.slotDurationMin} min
              </div>
            </div>
            <span className="text-xs text-primary font-medium">Modifier</span>
          </button>
        )}
        {staffList.length > 0 && step > 2 && (staff || noPref) && (
          <button
            onClick={() => setStep(2)}
            className="w-full mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-left hover:bg-primary/10 transition-colors animate-fade-in"
          >
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
              {staff?.photoUrl ? <img src={staff.photoUrl} alt="" className="w-full h-full object-cover" /> : <Users className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{staff ? staff.nom : 'Sans préférence'}</div>
              {staff?.role && <div className="text-xs text-muted-foreground truncate">{staff.role}</div>}
            </div>
            <span className="text-xs text-primary font-medium">Modifier</span>
          </button>
        )}
            {step > (staffList.length > 0 ? 3 : 2) && date && time && (
              <button
                onClick={() => setStep((staffList.length > 0 ? 3 : 2) as Step)}
                className="w-full mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 text-left hover:bg-primary/10 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {format(date, 'EEEE dd MMMM', { locale: fr })}
                  </div>
                  <div className="text-xs text-muted-foreground">à {time}</div>
                </div>
                <span className="text-xs text-primary font-medium">Modifier</span>
              </button>
            )}
            </div>

            {/* Step 1: Service */}
        {step === 1 && (
          <div className="space-y-6">
            {servicesByCategory.map(([cat, items]) => (
              <div key={cat}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {cat}
                </h2>
                <div className="space-y-2">
                  {items.map((s, index) => (
                    <button
                      key={`service-${index}`}
                      onClick={() => { setService(s); setStep((staffList.length > 0 ? 2 : 3) as Step); }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all bg-card active:scale-[0.98] hover:border-primary hover:shadow-md ${service?.id === s.id || service?.id === s.id ? 'border-primary shadow-md' : 'border-border'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[15px]">{s.nom}</div>
                          {s.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {s.description}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {settings.slotDurationMin} min
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-primary text-lg leading-none">
                            {s.prix.toLocaleString('fr-FR')}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">FCFA</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Staff */}
        {step === 2 && staffList.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-muted-foreground">Avec qui souhaitez-vous prendre rendez-vous ?</p>
            <button
              onClick={() => { setStaff(null); setNoPref(true); setStep(3); }}
              className={`w-full text-left p-4 rounded-2xl border-2 bg-card hover:border-primary transition-all active:scale-[0.99] ${noPref ? 'border-primary shadow-md' : 'border-border'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Sans préférence</div>
                  <div className="text-xs text-muted-foreground">Le salon vous attribuera la personne disponible</div>
                </div>
              </div>
            </button>
            {staffList.map((m, i) => (
              <button
                key={`staff-${i}`}
                onClick={() => { setStaff(m); setNoPref(false); setStep(3); }}
                className={`w-full text-left p-4 rounded-2xl border-2 bg-card hover:border-primary transition-all active:scale-[0.99] animate-fade-in ${staff?.id === m.id || (staff as any)?._id === m.id ? 'border-primary shadow-md' : 'border-border'
                  }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                    {m.photoUrl ? <img src={m.photoUrl} alt={m.nom} className="w-full h-full object-cover" /> : <Users className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{m.nom}</div>
                    {m.role && <div className="text-xs text-muted-foreground truncate">{m.role}</div>}
                    {m.specialties && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.specialties.slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Date & time */}
        {step === 3 && (
          <div className="space-y-5">
            <Card className="p-2 flex justify-center rounded-2xl">
              <Calendar
                mode="single"
                selected={date}
                onSelect={d => { setDate(d); setTime(null); }}
                disabled={d => {
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  if (d < today) return true;
                  if (settings.closedDays?.includes(d.getDay())) return true;
                  return false;
                }}
                locale={fr}
                className="pointer-events-auto"
              />
            </Card>
            {date && (
              <div className="space-y-4">
                {slotGroups.map(g => {
                  const Icon = g.icon;
                  const available = g.items.filter(t => !isSlotTaken(existing, dateStr, t));
                  return (
                    <div key={g.label}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {g.label}
                        </Label>
                        <span className="text-[11px] text-muted-foreground">
                          ({available.length} disponible{available.length > 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {g.items.map(t => {
                          const taken = isSlotTaken(existing, dateStr, t);
                          return (
                            <button
                              key={t}
                              disabled={taken}
                              onClick={() => setTime(t)}
                              className={`h-11 rounded-xl text-sm font-medium border-2 transition-all active:scale-95 ${taken
                                ? 'opacity-25 cursor-not-allowed border-muted line-through'
                                : time === t
                                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                  : 'bg-card border-border hover:border-primary'
                                }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Customer info */}
        {step === 4 && (
          <div className="space-y-5">
            {client && (
              <Card className="p-3 bg-primary/5 border-primary/20 flex items-center gap-3 animate-fade-in">
                <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {client.nom.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-medium">Connecté en tant que <span className="text-primary">{client.nom}</span></div>
                  <div className="text-muted-foreground truncate">Vos infos sont pré-remplies</div>
                </div>
              </Card>
            )}
            <div>
              <Label className="text-sm font-medium">Nom complet *</Label>
              <Input
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="h-12 mt-1.5 rounded-xl text-base"
                placeholder="Marie Nguema"
              />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Téléphone *</Label>
              <Input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="h-12 mt-1.5 rounded-xl text-base"
                placeholder="+237 6XX XXX XXX"
                type="tel"
                inputMode="tel"
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Email (optionnel)</Label>
              <Input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="h-12 mt-1.5 rounded-xl text-base"
                placeholder="vous@email.com"
                type="email"
                inputMode="email"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Notes (optionnel)</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="mt-1.5 rounded-xl"
                rows={3}
                placeholder="Demandes particulières..."
              />
            </div>
            {!client && (
              <p className="text-[11px] text-center text-muted-foreground">
                Astuce : <button onClick={() => navigate(`/explorer/login?redirect=/booking/${slug}/book`)} className="text-primary underline">créez un compte</button> pour retrouver vos rendez-vous et vos favoris.
              </p>
            )}
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && service && date && time && (
          <div className="space-y-4">
            <Card className="p-5 space-y-3 rounded-2xl">
              <Row label="Salon" value={salon.nom || salon.name} />
              <Row label="Prestation" value={service.nom} />
              {staffList.length > 0 && <Row label="Avec" value={staff?.nom || 'Sans préférence'} />}
              <Row label="Date" value={format(date, 'EEEE dd MMMM yyyy', { locale: fr })} />
              <Row label="Heure" value={time} />
              <Row label="Durée" value={`${settings.slotDurationMin} min`} />
              <Row label="Prix" value={`${service.prix.toLocaleString('fr-FR')} FCFA`} highlight />
              <div className="border-t pt-3">
                <Row label="Client" value={form.fullName} />
                <Row label="Téléphone" value={form.phone} />
                {form.email && <Row label="Email" value={form.email} />}
              </div>
              {errors.submit && <div className="text-red-500 text-sm">{errors.submit}</div>}
            </Card>
            <p className="text-xs text-muted-foreground text-center px-4">
              {settings.autoConfirm
                ? 'Votre rendez-vous sera confirmé automatiquement.'
                : 'Le salon recevra votre demande et la confirmera sous peu.'}
            </p>
          </div>
        )}
          </div>

          {/* Right Column: Desktop Sidebar Summary */}
          <div className="hidden md:block md:col-span-5 lg:col-span-4 sticky top-24 mt-12 md:mt-0">
            {step > 1 && (
              <Card className="p-5 shadow-xl border-border/50 bg-card/80 backdrop-blur-xl rounded-3xl">
                <h3 className="font-semibold text-lg mb-4">Votre réservation</h3>
                
                {service && (
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Prestation</div>
                    <button onClick={() => setStep(1)} className="w-full p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-3 text-left border border-transparent hover:border-primary/20">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{service.nom}</div>
                        <div className="text-xs text-muted-foreground">{service.prix.toLocaleString('fr-FR')} FCFA · {settings.slotDurationMin} min</div>
                      </div>
                      <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">MODIFIER</span>
                    </button>
                  </div>
                )}

                {staffList.length > 0 && step > 2 && (staff || noPref) && (
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Intervenant·e</div>
                    <button onClick={() => setStep(2)} className="w-full p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-3 text-left border border-transparent hover:border-primary/20">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                        {staff?.photoUrl ? <img src={staff.photoUrl} alt="" className="w-full h-full object-cover" /> : <Users className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{staff ? staff.nom : 'Sans préférence'}</div>
                      </div>
                      <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">MODIFIER</span>
                    </button>
                  </div>
                )}

                {step > (staffList.length > 0 ? 3 : 2) && date && time && (
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date & Heure</div>
                    <button onClick={() => setStep((staffList.length > 0 ? 3 : 2) as Step)} className="w-full p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors flex items-center gap-3 text-left border border-transparent hover:border-primary/20">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{format(date, 'EEEE dd MMMM', { locale: fr })}</div>
                        <div className="text-sm text-foreground font-semibold">{time}</div>
                      </div>
                      <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-md">MODIFIER</span>
                    </button>
                  </div>
                )}

                {/* Desktop Action Button */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  {service && (
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-semibold text-muted-foreground">Total à payer</span>
                      <span className="text-xl font-bold text-primary">{service.prix.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                  
                  {step === 3 && (
                    <Button className="w-full h-12 rounded-xl gradient-primary shadow-md" disabled={!date || !time} onClick={next}>
                      Continuer <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  {step === 4 && (
                    <Button className="w-full h-12 rounded-xl gradient-primary shadow-md" onClick={next} disabled={!form.fullName || !form.phone}>
                      Vérifier <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  {step === 5 && (
                    <Button className="w-full h-12 rounded-xl gradient-primary shadow-md" onClick={handleSubmit} disabled={isSubmitting}>
                      <Check className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Confirmation...' : 'Confirmer le rendez-vous'}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Sticky action bar (steps 2-4) for Mobile */}
      {step > 1 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            {service && (
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
                <div className="text-base font-bold text-primary leading-tight truncate">
                  {service.prix.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            )}
            {step === 3 && (
              <Button className="flex-[2] h-12 rounded-xl gradient-primary shadow-md" disabled={!date || !time} onClick={next}>
                Continuer <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 4 && (
              <Button className="flex-[2] h-12 rounded-xl gradient-primary shadow-md" onClick={next} disabled={!form.fullName || !form.phone}>
                Vérifier <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === 5 && (
              <Button className="flex-[2] h-12 rounded-xl gradient-primary shadow-md" onClick={handleSubmit} disabled={isSubmitting}>
                <Check className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Confirmation...' : 'Confirmer'}
              </Button>
            )}
          </div>
        </div>
      )}
    </BrandedShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'font-bold text-primary' : 'font-medium'}>{value}</span>
    </div>
  );
}