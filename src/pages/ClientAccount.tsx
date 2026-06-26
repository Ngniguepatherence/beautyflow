import React, { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import {
  Heart, MapPin, Sparkles, Calendar, LogOut, Trash2, History, User as UserIcon,
  Mail, Phone, Edit3, Check, X, Camera, Award, Share2, MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { ExplorerHeader } from '@/components/explorer/ExplorerHeader';
import { getSalonAccounts } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export default function ClientAccount() {
  const { client, signout, toggleFavorite, isFavorite, update } = useClientAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'profile';
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', avatarUrl: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  if (!client) return <Navigate to="/explorer/login?redirect=/explorer/account" replace />;

  const allSalons = getSalonAccounts();
  const favorites = allSalons.filter(s => isFavorite(s.id));

  const startEdit = () => {
    setForm({
      nom: client.nom,
      telephone: client.telephone || '',
      email: client.email,
      avatarUrl: client.avatarUrl || '',
    });
    setEditing(true);
  };
  const saveEdit = () => {
    update({
      nom: form.nom.trim() || client.nom,
      telephone: form.telephone.trim() || undefined,
      avatarUrl: form.avatarUrl || undefined,
    });
    setEditing(false);
    toast({ title: 'Profil mis à jour ✨' });
  };
  const onPickAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, avatarUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const initials = client.nom.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const waLink = client.telephone ? `https://wa.me/${client.telephone.replace(/[^\d]/g, '')}` : '';

  return (
    <div className="min-h-screen bg-background pb-16">
      <ExplorerHeader />

      {/* Hero Banner with Glassmorphism & Soft Gradients */}
      <div className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-primary/30 to-purple-800/40 mix-blend-multiply" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.45), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.3), transparent 45%)',
        }} />
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 pt-10 pb-24 sm:pb-28">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
            {/* Profile Avatar Selection */}
            <div className="relative">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl ring-4 ring-white/30 overflow-hidden flex items-center justify-center">
                {client.avatarUrl ? (
                  <img src={client.avatarUrl} alt={client.nom} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-white to-pink-200 bg-clip-text text-transparent">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center text-primary hover:scale-110 active:scale-95 transition-transform border border-border/30"
                title="Changer la photo"
              >
                <Camera className="h-4.5 w-4.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files?.[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = () => { update({ avatarUrl: String(reader.result) }); toast({ title: 'Photo mise à jour' }); };
                reader.readAsDataURL(f);
              }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5 text-pink-300" /> Membre Privilege
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight drop-shadow-sm">{client.nom}</h1>
              <p className="text-sm text-white/80 mt-1 drop-shadow-sm">{client.email}</p>
            </div>

            <div className="shrink-0">
              <Button size="sm" variant="secondary" className="rounded-full bg-white/95 text-foreground hover:bg-white font-bold shadow-md hover:shadow-lg transition-all" onClick={() => { signout(); navigate('/explorer'); }}>
                <LogOut className="h-4 w-4 mr-1.5" /> Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Floating Overlap Cards */}
      <div className="max-w-4xl mx-auto px-4 -mt-14 sm:-mt-16 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <StatPill icon={Heart} value={favorites.length} label="Favoris" gradient="from-rose-500 to-pink-500" />
          <StatPill icon={History} value={(client.visits || []).length} label="Réservations" gradient="from-amber-500 to-orange-500" />
          <StatPill icon={Award} value={Math.max(1, Math.floor((Date.now() - new Date(client.createdAt || client.dateCreation || Date.now()).getTime()) / 86400000))} label="Jours membre" gradient="from-fuchsia-500 to-purple-600" />
        </div>
      </div>

      {/* Main Tabs Dashboard */}
      <div className="max-w-4xl mx-auto px-4 mt-8 animate-fade-in">
        <Tabs defaultValue={tab}>
          <TabsList className="grid grid-cols-3 w-full h-13 p-1 rounded-2xl bg-muted/50 backdrop-blur-lg border border-border/40">
            <TabsTrigger value="profile" className="rounded-xl font-bold py-2.5 data-[state=active]:shadow-md"><UserIcon className="h-4.5 w-4.5 sm:mr-2" /><span className="hidden sm:inline">Mon Profil</span></TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-xl font-bold py-2.5 data-[state=active]:shadow-md"><Heart className="h-4.5 w-4.5 sm:mr-2" /><span className="hidden sm:inline">Mes Favoris</span></TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl font-bold py-2.5 data-[state=active]:shadow-md"><History className="h-4.5 w-4.5 sm:mr-2" /><span className="hidden sm:inline">Historique</span></TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile Management */}
          <TabsContent value="profile" className="mt-6 space-y-4">
            <Card className="p-6 shadow-md border-border/60 rounded-3xl bg-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-lg text-foreground">Informations personnelles</h3>
                {!editing ? (
                  <Button size="sm" variant="outline" className="rounded-full h-9 px-4 font-semibold shadow-sm" onClick={startEdit}>
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="rounded-full h-9" onClick={() => setEditing(false)}>
                      Annuler
                    </Button>
                    <Button size="sm" className="gradient-primary rounded-full h-9 px-4 font-bold shadow-md" onClick={saveEdit}>
                      <Check className="h-4 w-4 mr-1.5" /> Enregistrer
                    </Button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow icon={UserIcon} label="Nom complet" value={client.nom} />
                  <InfoRow icon={Mail} label="Adresse email" value={client.email} />
                  <InfoRow
                    icon={MessageCircle}
                    label="WhatsApp / Téléphone"
                    value={client.telephone || 'Non spécifié'}
                    action={waLink ? (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 hover:underline px-2.5 py-1 bg-emerald-50 rounded-full dark:bg-emerald-950/30">WhatsApp</a>
                    ) : null}
                    muted={!client.telephone}
                  />
                  <InfoRow icon={Calendar} label="Date d'inscription" value={format(new Date(client.createdAt || client.dateCreation || Date.now()), 'd MMMM yyyy', { locale: fr })} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField icon={UserIcon} label="Nom complet" value={form.nom} onChange={v => setForm({ ...form, nom: v })} />
                    <EditField icon={Mail} label="Adresse email" value={form.email} onChange={() => { }} disabled />
                  </div>
                  <EditField icon={MessageCircle} label="Numéro WhatsApp" placeholder="+237 6XX XXX XXX" value={form.telephone} onChange={v => setForm({ ...form, telephone: v })} />
                  <p className="text-[11px] text-muted-foreground pl-1 leading-relaxed">
                    Ajoutez votre numéro de téléphone pour permettre aux salons de vous contacter en cas de changement d'horaire ou pour finaliser votre rendez-vous.
                  </p>
                </div>
              )}
            </Card>

            {/* Loyalty Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-primary/20 rounded-3xl flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 shadow-sm text-primary">
                  <Sparkles className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Recommandations exclusives</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Découvrez des offres privilèges et des prestations adaptées à vos habitudes beauté.
                  </p>
                </div>
              </Card>
              <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent border-amber-500/20 rounded-3xl flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-amber-500/15 flex items-center justify-center shrink-0 shadow-sm text-amber-600">
                  <Award className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Programme de Fidélité</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Cumulez des points à chaque rendez-vous et débloquez des prestations gratuites dans vos salons favoris.
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Favorites */}
          <TabsContent value="favorites" className="mt-6">
            {favorites.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border border-dashed border-border/60 bg-muted/20">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Heart className="h-8 w-8 fill-current" />
                </div>
                <h4 className="font-bold text-lg">Aucun salon favori</h4>
                <p className="text-xs text-muted-foreground mt-1.5 mb-6 max-w-sm mx-auto">
                  Découvrez les meilleurs salons et ajoutez-les à vos favoris en cliquant sur l'icône de cœur.
                </p>
                <Button asChild className="gradient-primary rounded-full font-bold px-6 py-2.5 shadow-md"><Link to="/explorer">Explorer les salons</Link></Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((s: any) => {
                  const salonId = s._id || s.id;
                  const primary = s.branding?.primaryColor || '350 75% 55%';
                  const accent = s.branding?.secondaryColor || '25 95% 60%';
                  const salonName = s.name || s.nom || 'Salon';
                  const salonSlug = s.slug;
                  const salonAddress = s.address || s.adresse || s.ville || '';
                  const salonLogo = s.logoUrl || s.branding?.logoUrl;
                  const salonBanner = s.bannerUrl || s.branding?.bannerUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop';
                  return (
                    <Card key={salonId} className="overflow-hidden group cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-3xl bg-card border-border/50" onClick={() => navigate(`/booking/${salonSlug}`)}>
                      <div className="h-32 relative" style={{ background: `linear-gradient(135deg, hsl(${primary}), hsl(${accent}))` }}>
                        <img src={salonBanner} alt={salonName} className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <Button
                          size="icon" variant="secondary"
                          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 hover:bg-white text-destructive shadow-md hover:scale-105 active:scale-95 transition-all"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(salonId); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-3 left-4 text-white">
                          <div className="font-extrabold text-base drop-shadow-md truncate">{salonName}</div>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-3 bg-card">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{salonAddress}</span>
                        </div>
                        <span className="text-xs font-bold text-primary whitespace-nowrap group-hover:translate-x-1 transition-transform">Réserver →</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: History */}
          <TabsContent value="history" className="mt-6">
            {(client.visits || []).length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border border-dashed border-border/60 bg-muted/20">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/80 flex items-center justify-center mb-4 text-muted-foreground">
                  <History className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-lg">Aucune réservation</h4>
                <p className="text-xs text-muted-foreground mt-1.5 mb-6">
                  Vos rendez-vous passés et futurs s'afficheront ici.
                </p>
                <Button asChild className="gradient-primary rounded-full font-bold px-6 py-2.5 shadow-md"><Link to="/explorer">Prendre rendez-vous</Link></Button>
              </Card>
            ) : (
              <Card className="divide-y border border-border/50 rounded-3xl overflow-hidden shadow-md">
                {(client.visits || []).map((v: any, i: number) => (
                  <Link key={i} to={`/booking/${v.salonSlug}`} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors bg-card">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-foreground truncate">{v.salonNom}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{format(new Date(v.visitedAt), 'd MMM yyyy à HH:mm', { locale: fr })}</div>
                    </div>
                    <Calendar className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </Link>
                ))}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, value, label, gradient }: { icon: any; value: number; label: string; gradient: string }) {
  return (
    <Card className="p-3 sm:p-4 text-center shadow-lg border-border/60 backdrop-blur bg-card/95 hover:-translate-y-0.5 transition-transform">
      <div className={`h-9 w-9 sm:h-10 sm:w-10 mx-auto rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-1.5 shadow-md`}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
      <div className="text-lg sm:text-2xl font-extrabold leading-none">{value}</div>
      <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 font-medium">{label}</div>
    </Card>
  );
}

function InfoRow({ icon: Icon, label, value, action, muted }: { icon: any; label: string; value: string; action?: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
      <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
        <div className={`text-sm font-medium truncate ${muted ? 'text-muted-foreground italic' : ''}`}>{value}</div>
      </div>
      {action}
    </div>
  );
}

function EditField({ icon: Icon, label, value, onChange, placeholder, disabled }: { icon: any; label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
      <div className="relative mt-1">
        <Icon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 h-11 rounded-xl"
        />
      </div>
    </div>
  );
}