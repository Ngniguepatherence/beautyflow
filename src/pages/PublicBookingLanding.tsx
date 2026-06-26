import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState<string>('services');
  const tabsRef = useRef<HTMLDivElement>(null);
  const fallbackImages = useMemo(() => [
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=800&auto=format&fit=crop",
  ], []);


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

  const handleSeeAllImages = () => {
    setActiveTab('gallery');
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const img1 = gallery[0] || fallbackImages[0];
  const img2 = gallery[1] || fallbackImages[1];
  const img3 = gallery[2] || fallbackImages[2];

  return (
    <BrandedShell salon={salon} showHeader={true}>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-32">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <span>/</span>
          <span className="capitalize">{salon.typeEtablissement || 'Salons'}</span>
          <span>/</span>
          <span>{salon.pays || 'Cameroun'}</span>
          <span>/</span>
          <span>{salon.ville || 'Douala'}</span>
          <span>/</span>
          <span className="text-foreground font-semibold truncate">{salon.nom || salon.name}</span>
        </nav>

        {/* Title & Ratings Block */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">{salon.nom || salon.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1 bg-amber-400/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                <Star className="h-3.5 w-3.5 fill-current" />
                {rating.toFixed(1)}
              </span>
              <span>({reviewCount} avis)</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ouvert jusqu'à 19:00</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {salon.address || salon.adresse || salon.ville}</span>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="icon" className="rounded-full h-11 w-11 shadow-sm border-border hover:bg-muted" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="outline" size="icon"
              className={`rounded-full h-11 w-11 shadow-sm border-border transition-all ${fav ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20' : 'hover:bg-muted'}`}
              onClick={handleFav}
            >
              <Heart className={`h-5 w-5 ${fav ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Premium Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-8 overflow-hidden rounded-2xl md:rounded-3xl shadow-lg border border-border/40 bg-muted/20">
          {/* Left large image */}
          <div className="col-span-1 md:col-span-8 aspect-[16/10] md:aspect-[16/9.5] relative overflow-hidden group">
            <img
              src={img1}
              alt={`${salon.nom || salon.name} main`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 cursor-pointer"
              onClick={() => setLightbox(img1)}
              onError={(e) => { e.currentTarget.src = fallbackImages[0]; }}
            />
          </div>
          
          {/* Right stacked images */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-3">
            <div className="flex-1 aspect-[16/10] relative overflow-hidden group">
              <img
                src={img2}
                alt={`${salon.nom || salon.name} gallery 2`}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 cursor-pointer"
                onClick={() => setLightbox(img2)}
                onError={(e) => { e.currentTarget.src = fallbackImages[1]; }}
              />
            </div>
            <div className="flex-1 aspect-[16/10] relative overflow-hidden group">
              <img
                src={img3}
                alt={`${salon.nom || salon.name} gallery 3`}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 cursor-pointer"
                onClick={() => setLightbox(img3)}
                onError={(e) => { e.currentTarget.src = fallbackImages[2]; }}
              />
              <Button
                onClick={handleSeeAllImages}
                className="absolute bottom-4 right-4 bg-background/90 hover:bg-background text-foreground backdrop-blur border border-border/80 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transition-all"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Voir toutes les photos</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section: Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Side: Service Details & Tabs */}
          <div className="lg:col-span-8" ref={tabsRef}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex overflow-x-auto w-full mb-6 snap-x-pad scrollbar-none justify-start pb-3 border-b border-border/40 bg-transparent h-auto p-0 gap-6 rounded-none">
                <TabsTrigger value="services" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Services</TabsTrigger>
                <TabsTrigger value="gallery" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Galerie</TabsTrigger>
                <TabsTrigger value="staff" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Équipe</TabsTrigger>
                <TabsTrigger value="reviews" className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-base font-semibold transition-all">Avis</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="mt-2 animate-fade-in">
                {servicesByCat.length > 1 && (
                  <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-none snap-x-pad border-b border-border/40">
                    <button
                      onClick={() => setFilterCat('all')}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${filterCat === 'all' ? 'bg-foreground text-background shadow-md' : 'bg-muted/50 hover:bg-muted text-foreground'}`}
                    >
                      Toutes
                    </button>
                    {servicesByCat.map(([cat]) => (
                      <button
                        key={`filter-${cat}`}
                        onClick={() => setFilterCat(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${filterCat === cat ? 'bg-foreground text-background shadow-md' : 'bg-muted/50 hover:bg-muted text-foreground'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-8">
                  {servicesByCat.filter(([cat]) => filterCat === 'all' || filterCat === cat).map(([cat, items]) => (
                    <div key={cat}>
                      <h3 className="text-lg font-extrabold text-foreground mb-4">{cat}</h3>
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
                              <div className="text-[10px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-wider">Réserver</div>
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
                        <img src={src} alt={`${salon.nom || salon.name} ${i + 1}`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">{txt}</p>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Side: Sidebar Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 border border-border/50 shadow-lg rounded-3xl bg-card space-y-6">
              <div>
                <h3 className="font-extrabold text-lg mb-3">À propos de nous</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {salon.branding?.description || salon.description || 'Bienvenue dans notre salon d\'exception. Nous mettons tout notre savoir-faire à votre service pour révéler votre beauté naturelle dans un cadre chaleureux et relaxant.'}
                </p>
              </div>

              {instant && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm text-white">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Confirmation instantanée</span>
                    <span className="text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">Votre créneau est automatiquement validé.</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {(salon.branding?.location || salon.address || salon.adresse || salon.ville) && (
                  <InfoLine icon={MapPin} text={salon.branding?.location || salon.address || salon.adresse || salon.ville} />
                )}
                {(salon.branding?.hours || salon.horaires) && (
                  <InfoLine icon={Clock} text={salon.branding?.hours || salon.horaires} />
                )}
                {salon.branding?.instagram && (
                  <InfoLine icon={Instagram} text={salon.branding.instagram} />
                )}
              </div>
            </Card>

            {/* Embedded Google Maps card */}
            <Card className="overflow-hidden border border-border/50 shadow-lg rounded-3xl">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(salon.branding?.location || salon.address || salon.adresse || salon.ville || 'Cameroun')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="bg-muted"
              />
            </Card>
          </div>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
            <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" />
          </div>
        )}

        {/* Sticky bottom footer bar (Desktop & Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-background/95 backdrop-blur-xl border-t border-border/50 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-extrabold text-foreground truncate text-sm sm:text-base">{salon.nom || salon.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{allServices.length} prestations disponibles</div>
            </div>
            <Button
              size="lg"
              className="bg-black hover:bg-neutral-800 text-white rounded-full font-bold px-6 py-3 text-sm sm:text-base transition-transform active:scale-[0.98] shadow-md flex items-center gap-2"
              onClick={() => navigate(`/booking/${slug}/book`)}
            >
              <Calendar className="h-4 w-4" />
              <span>Réserver maintenant</span>
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