import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  MapPin, Clock, Star, Sparkles, Calendar, Heart, Share2,
  Instagram, Users, Camera, Award, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BrandedShell } from '@/components/booking/BrandedShell';
import { marketplaceApi } from '@/lib/api';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { toast } from '@/hooks/use-toast';
import { getCategoryImage } from '@/lib/category-images';
export default function PublicBookingLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { client, isFavorite, toggleFavorite, logVisit } = useClientAuth();
  const [salon, setSalon] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');

  useEffect(() => {
    if (slug) {
      marketplaceApi.getSalonBySlug(slug).then((res) => {
        if (res.success) {
          setSalon(res.data);
          setAllServices(res.data.prestations || []);
        } else {
          navigate('/booking/not-found', { replace: true });
        }
      }).catch(() => {
        navigate('/booking/not-found', { replace: true });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [slug, navigate]);

  useEffect(() => {
    if (salon && client) {
      logVisit({ salonId: salon._id || salon.id, salonSlug: salon.slug!, salonNom: salon.nom || salon.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salon?._id, salon?.id, client?.id]);

  const servicesByCat = useMemo(() => {
    const m = new Map<string, typeof allServices>();
    for (const s of allServices) {
      const c = s.categorie || 'Prestations';
      if (!m.has(c)) m.set(c, []);
      m.get(c)!.push(s);
    }
    return Array.from(m.entries());
  }, [allServices]);

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  if (!salon) return <Navigate to="/booking/not-found" replace />;

  const banner = salon.branding?.bannerUrl || salon.bannerUrl || getCategoryImage((salon.branding?.category || salon.typeEtablissement)?.split(/[ _]/)[0]);
  const logo = salon.branding?.logoUrl || salon.logoUrl;
  const gallery = salon.branding?.gallery || salon.galleryUrls || salon.gallery || [];
  const staff = salon.branding?.staff || salon.staff || [];
  const rating = salon.branding?.rating ?? salon.rating ?? 4.8;
  const reviewCount = salon.branding?.reviewCount ?? salon.reviewCount ?? 0;
  const fav = isFavorite(salon._id || salon.id);
  const instant = salon.bookingSettings?.autoConfirm ?? true;



  const handleFav = () => {
    if (!client) { navigate(`/explorer/login?redirect=/booking/${slug}`); return; }
    toggleFavorite(salon._id || salon.id);
    toast({ title: fav ? 'Retiré des favoris' : '♥ Ajouté à vos favoris' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: salon.nom, url }); } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Lien copié' });
    }
  };

  return (
    <BrandedShell salon={salon} showHeader={false}>
      <div className="max-w-6xl mx-auto pb-28">
        {/* Hero banner */}
        <div className="relative h-56 sm:h-72 md:h-80 w-full md:rounded-b-3xl overflow-hidden bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20">
          <img
            src={banner}
            alt={salon.nom || salon.name}
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = getCategoryImage(); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent md:bg-gradient-to-t md:from-black/60 md:via-black/20" />

          {/* Top actions */}
          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full bg-background/90 backdrop-blur shadow" onClick={() => navigate('/explorer')}>
              <Sparkles className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" className="h-9 w-9 rounded-full bg-background/90 backdrop-blur shadow" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary" size="icon"
                className={`h-9 w-9 rounded-full backdrop-blur shadow transition-all ${fav ? 'bg-primary text-primary-foreground hover:bg-primary' : 'bg-background/90'}`}
                onClick={handleFav}
              >
                <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Content wrapper */}
        <div className="px-4 relative md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-start max-w-6xl mx-auto z-10">
          
          {/* Left Column: Info Card */}
          <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-24 z-20 -mt-16 md:-mt-24">
            <div className="bg-card rounded-3xl shadow-2xl border border-border/40 p-5 md:p-6 animate-fade-in">
              {/* Overlapping Logo */}
              <div className="flex justify-between items-start mb-4">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl md:rounded-[1.75rem] bg-card border-4 border-background shadow-xl flex items-center justify-center overflow-hidden shrink-0 -mt-12 md:-mt-16 bg-white">
                  {logo ? (
                    <img src={logo} alt={salon.nom || salon.name} className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="h-10 w-10 text-primary" />
                  )}
                </div>
                {(salon.branding?.category || salon.typeEtablissement) && (
                  <Badge variant="secondary" className="text-[10px] md:text-xs font-semibold shadow-sm bg-primary/5 text-primary border-primary/10">
                    {salon.branding?.category || salon.typeEtablissement}
                  </Badge>
                )}
              </div>

              {/* Title & Rating */}
              <div className="pb-2">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">{salon.nom || salon.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1 bg-amber-400/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {rating.toFixed(1)}
                  </span>
                  <span>({reviewCount} avis)</span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Award className="h-3.5 w-3.5" /> Pro
                  </span>
                </div>
              </div>

            {instant && (
              <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
                <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm text-white">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Confirmation instantanée</span>
                  <span className="text-emerald-600/80 dark:text-emerald-400/80 block">Créneau bloqué automatiquement</span>
                </div>
              </div>
            )}

            {/* Description */}
            {(salon.branding?.description || salon.description) && (
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed animate-fade-in line-clamp-3">
                {salon.branding?.description || salon.description}
              </p>
            )}

            {/* Quick info */}
            <div className="mt-6 space-y-2.5">
              {(salon.branding?.location || salon.address || salon.adresse || salon.ville) && (
                <InfoLine icon={MapPin} text={salon.branding?.location || salon.address || salon.adresse || salon.ville} />
              )}
              {(salon.branding?.hours || salon.horaires) && <InfoLine icon={Clock} text={salon.branding?.hours || salon.horaires} />}
              {salon.branding?.instagram && (
                <InfoLine icon={Instagram} text={salon.branding.instagram} />
              )}
            </div>

            {/* Desktop CTA (hidden on mobile) */}
            <div className="hidden md:block mt-8">
              <Button
                size="lg"
                className="w-full h-14 text-base gradient-primary shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all rounded-2xl font-bold"
                onClick={() => navigate(`/booking/${slug}/book`)}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Réserver maintenant
              </Button>
            </div>
          </div>
          </div>

          {/* Right Column: Tabs */}
          <div className="md:col-span-7 lg:col-span-8 mt-8 md:mt-6">
            {/* Tabs: Services / Galerie / Équipe / Avis / À propos */}
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="flex overflow-x-auto w-full mb-6 snap-x-pad scrollbar-none justify-start pb-3 border-b border-border/40 bg-transparent h-auto p-0 gap-6 rounded-none">
                <TabsTrigger value="services" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Services</TabsTrigger>
                <TabsTrigger value="gallery" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Galerie</TabsTrigger>
                <TabsTrigger value="staff" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Équipe</TabsTrigger>
                <TabsTrigger value="reviews" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Avis</TabsTrigger>
                <TabsTrigger value="about" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">À propos</TabsTrigger>
              </TabsList>

            <TabsContent value="services" className="mt-2 animate-fade-in">
              {/* Filtre par catégorie de services */}
              {servicesByCat.length > 1 && (
                <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-none snap-x-pad border-b border-border/40">
                  <button
                    onClick={() => setFilterCat('all')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${filterCat === 'all' ? 'bg-foreground text-background shadow-md' : 'bg-muted/50 hover:bg-muted text-foreground'}`}
                  >
                    Toutes
                  </button>
                  {servicesByCat.map(([cat]) => (
                    <button
                      key={`filter-${cat}`}
                      onClick={() => setFilterCat(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${filterCat === cat ? 'bg-foreground text-background shadow-md' : 'bg-muted/50 hover:bg-muted text-foreground'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-10">
                {servicesByCat.filter(([cat]) => filterCat === 'all' || filterCat === cat).map(([cat, items]) => (
                  <div key={cat}>
                    <h3 className="text-xl font-bold text-foreground mb-4">{cat}</h3>
                    <div className="space-y-3">
                      {items.map(s => (
                        <button
                          key={s._id || s.id || `service-${s.nom}`}
                          onClick={() => navigate(`/booking/${slug}/book?serviceId=${s._id || s.id}`)}
                          className="w-full text-left p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-lg transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">{s.nom}</div>
                            {s.description && <div className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">{s.description}</div>}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-foreground whitespace-nowrap">{s.prix.toLocaleString('fr-FR')} FCFA</div>
                            <div className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">Réserver</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

              <TabsContent value="gallery" className="mt-2 animate-fade-in">
                {gallery.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-3xl border border-dashed border-border/60">
                    <Camera className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <span className="text-base font-medium">Aucune photo pour le moment.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {gallery.map((src: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setLightbox(src)}
                        className="relative aspect-square overflow-hidden rounded-2xl group shadow-sm hover:shadow-xl transition-all"
                      >
                        <img src={src} alt={`${salon.nom || salon.name} ${i + 1}`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="staff" className="mt-2 animate-fade-in">
                {staff.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground bg-muted/30 rounded-3xl border border-dashed border-border/60">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <span className="text-base font-medium">L'équipe n'est pas encore renseignée.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {staff.map((m: any, i: number) => (
                      <Card key={m._id || m.id || `staff-${i}`} className="p-4 flex items-center gap-4 hover:shadow-xl transition-shadow border-border/50 rounded-2xl bg-card group">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10 group-hover:border-primary/30 transition-colors">
                          {m.photoUrl ? <img src={m.photoUrl} alt={m.nom} className="w-full h-full object-cover" /> : <Users className="h-6 w-6 text-primary/40" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-bold text-foreground">{m.nom}</div>
                          {m.role && <div className="text-sm text-muted-foreground mt-0.5">{m.role}</div>}
                          {m.specialties && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {m.specialties.slice(0, 3).map((s: string) => (
                                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-2 space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-8 rounded-3xl bg-card border border-border/50 shadow-sm">
                  <div className="text-center">
                    <div className="text-6xl font-black text-foreground tracking-tighter">{rating.toFixed(1)}</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">sur 5</div>
                  </div>
                  <div className="w-px h-16 bg-border hidden sm:block" />
                  <div className="flex flex-col gap-2 items-center sm:items-start">
                    <div className="flex text-amber-400 gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <Star key={v} className={`h-6 w-6 ${v <= Math.round(rating) ? 'fill-current' : 'text-muted/20'}`} />
                      ))}
                    </div>
                    <span className="text-base font-medium text-foreground">{reviewCount > 0 ? reviewCount : 'Quelques'} avis de clients vérifiés</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {['Un service impeccable, le personnel est très à l\'écoute et le résultat est juste parfait ! Je recommande vivement.', 'Très beau salon, propre et accueillant. J\'ai passé un excellent moment de détente.', 'Professionnalisme au top ! Ponctuel et très doué.'].map((txt, i) => (
                    <Card key={`review-${i}`} className="p-6 space-y-4 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {['M', 'S', 'L'][i]}
                          </div>
                          <div>
                            <div className="font-bold text-base">{['Marie', 'Sophie', 'Laetitia'][i]}</div>
                            <div className="text-sm text-muted-foreground">Il y a {i + 2} jours</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex text-amber-400 gap-0.5">
                        {[1, 2, 3, 4, 5].map(v => (
                          <Star key={v} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-base text-foreground/80 leading-relaxed font-medium">{txt}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="mt-2 space-y-10 animate-fade-in">
                <div>
                  <h3 className="font-bold text-2xl mb-4">À propos de {salon.nom || salon.name}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {salon.branding?.description || salon.description || 'Ce salon n\'a pas encore fourni de description détaillée. Visitez-nous pour découvrir nos excellentes prestations !'}
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-2xl mb-4">Localisation et Horaires</h3>
                  <Card className="overflow-hidden border border-border/50 shadow-lg rounded-3xl">
                    <iframe
                      title="Google Maps"
                      width="100%"
                      height="320"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(salon.branding?.location || salon.address || salon.adresse || salon.ville || 'Cameroun')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      className="bg-muted"
                    />
                    <div className="p-6 md:p-8 space-y-5 bg-card">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0 mt-0.5">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground font-medium mb-1">Adresse</div>
                          <div className="text-base font-bold text-foreground leading-tight">{salon.branding?.location || salon.address || salon.adresse || salon.ville || 'Adresse non spécifiée'}</div>
                        </div>
                      </div>
                      {(salon.branding?.hours || salon.horaires) && (
                        <div className="flex items-start gap-4 pt-2">
                          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0 mt-0.5">
                            <Clock className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground font-medium mb-1">Horaires</div>
                            <div className="text-base font-bold text-foreground whitespace-pre-wrap leading-relaxed">{salon.branding?.hours || salon.horaires}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" />
          </div>
        )}

        {/* Sticky CTA (Mobile only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-xl border-t border-border/50 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="max-w-2xl mx-auto">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold gradient-primary shadow-xl active:scale-[0.98] transition-transform rounded-2xl"
              onClick={() => navigate(`/booking/${slug}/book`)}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Réserver maintenant
            </Button>
          </div>
        </div>
      </div>
    </BrandedShell>
  );
}

function InfoLine({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border hover:border-primary/40 transition-colors">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}