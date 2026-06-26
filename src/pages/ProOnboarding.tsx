import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Camera, Users, CheckCircle2, Loader2, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, authApi, salonsApi } from '@/lib/api';

type Step = 'AUTH' | 'DETAILS' | 'PHOTOS' | 'STAFF' | 'DONE';

export default function ProOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { session, setSession } = useAuth();
  const [step, setStepState] = useState<Step>(() => {
    const saved = localStorage.getItem('onboarding_step');
    return (saved as Step) || 'AUTH';
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const setStep = (newStep: Step) => {
    setStepState(newStep);
    localStorage.setItem('onboarding_step', newStep);
  };

  const [form, setForm] = useState({
    name: '', slogan: '', phone: '', email: '', address: '', ville: '', pays: 'CM', devise: 'FCFA', typeEtablissement: 'salon_coiffure', description: '', horaires: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [staffList, setStaffList] = useState<{ name: string, email: string, password: string, telephone: string }[]>([]);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', telephone: '' });

  const getText = (fr: string, en: string) => language === 'fr' ? fr : en;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const salonExistsParam = params.get('salonExists');
    const errorParam = params.get('error');

    if (errorParam) {
      toast({ title: 'Erreur', description: "L'authentification a échoué. Veuillez réessayer.", variant: 'destructive' });
      setStep('AUTH');
      navigate('/pro/onboarding', { replace: true });
    } else if (tokenParam) {
      setToken(tokenParam);
      localStorage.setItem('token', tokenParam);

      // Récupérer les infos de l'utilisateur connecté via Google
      authApi.getMe(tokenParam)
        .then(data => {
          if (data.success && data.session) {
            const mappedSession = {
              type: 'salon' as const,
              salonId: data.session.salonId || undefined,
              userId: data.session.userId,
              userRole: data.session.userRole,
              userName: data.session.userName,
              email: data.session.userEmail,
              timestamp: Date.now()
            };
            setSession(mappedSession);

            if (salonExistsParam === 'true' || data.session.salonId) {
              toast({ title: 'Bienvenue', description: 'Vous avez déjà un salon configuré.' });
              localStorage.removeItem('onboarding_step');
              navigate('/dashboard');
            } else {
              setStep('DETAILS');
              navigate('/pro/onboarding', { replace: true });
            }
          }
        })
        .catch(err => {
          console.error('Erreur getMe sur redirection:', err);
          toast({ title: 'Erreur', description: 'Erreur lors du chargement de la session', variant: 'destructive' });
        });
    } else {
      // Pas de paramètre dans l'URL. On vérifie si une session ou un token existe déjà en local
      const storedToken = localStorage.getItem('token');
      if (session) {
        if (session.salonId) {
          if (step === 'AUTH') {
            localStorage.removeItem('onboarding_step');
            navigate('/dashboard');
          }
        } else {
          // Utilisateur connecté mais sans salon -> va direct à l'étape DETAILS
          setStep('DETAILS');
        }
      } else if (storedToken) {
        // Token présent mais session pas encore restaurée, on le force ici
        authApi.getMe(storedToken)
          .then(data => {
            if (data.success && data.session) {
              const mappedSession = {
                type: 'salon' as const,
                salonId: data.session.salonId || undefined,
                userId: data.session.userId,
                userRole: data.session.userRole,
                userName: data.session.userName,
                email: data.session.userEmail,
                timestamp: Date.now()
              };
              setSession(mappedSession);
              if (data.session.salonId) {
                if (step === 'AUTH') {
                  localStorage.removeItem('onboarding_step');
                  navigate('/dashboard');
                }
              } else {
                setStep('DETAILS');
              }
            }
          })
          .catch(() => {
            localStorage.removeItem('token');
          });
      }
    }
  }, [location, navigate, session, setSession, step]);

  const handleCreateSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const activeToken = token || localStorage.getItem('token');
      if (!activeToken) {
        toast({ title: 'Erreur', description: 'Veuillez vous connecter d’abord.', variant: 'destructive' });
        setStep('AUTH');
        return;
      }

      const data = await salonsApi.onboard(form, activeToken);
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);

        // Mettre à jour la session globale du salon
        if (data.session) {
          const mappedSession = {
            type: 'salon' as const,
            salonId: data.session.salonId || undefined,
            userId: data.session.userId,
            userRole: data.session.userRole,
            userName: data.session.userName,
            email: data.session.userEmail,
            timestamp: Date.now()
          };
          setSession(mappedSession);
        }

        setStep('PHOTOS');
      } else {
        toast({ title: 'Erreur', description: data.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Erreur lors de la création', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    setLoading(true);
    try {
      const activeToken = token || localStorage.getItem('token');
      if (!activeToken) {
        toast({ title: 'Erreur', description: 'Veuillez vous connecter d’abord.', variant: 'destructive' });
        setStep('AUTH');
        return;
      }

      const salonId = session?.salonId;
      if (!salonId) {
        toast({ title: 'Erreur', description: 'Salon introuvable dans la session. Veuillez reconfigurer les détails.', variant: 'destructive' });
        setStep('DETAILS');
        return;
      }

      let logoUrl = '';
      let bannerUrl = '';
      let uploadedGalleryUrls: string[] = [];

      // 1. Upload Logo
      if (logoFile) {
        const logoData = new FormData();
        logoData.append('image', logoFile);

        const resLogo = await fetch(`${API_BASE_URL}/upload/single`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`
          },
          body: logoData
        });

        if (!resLogo.ok) {
          const errData = await resLogo.json().catch(() => ({}));
          throw new Error(errData.message || 'Erreur lors du téléversement du logo');
        }
        const dataLogo = await resLogo.json();
        logoUrl = dataLogo.url || '';
      }

      // 2. Upload Banner
      if (bannerFile) {
        const bannerData = new FormData();
        bannerData.append('image', bannerFile);

        const resBanner = await fetch(`${API_BASE_URL}/upload/single`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`
          },
          body: bannerData
        });

        if (!resBanner.ok) {
          const errData = await resBanner.json().catch(() => ({}));
          throw new Error(errData.message || 'Erreur lors du téléversement de la bannière');
        }
        const dataBanner = await resBanner.json();
        bannerUrl = dataBanner.url || '';
      }

      // 3. Upload Gallery
      if (galleryFiles.length > 0) {
        const galleryData = new FormData();
        galleryFiles.forEach(file => {
          galleryData.append('images', file);
        });

        const resGallery = await fetch(`${API_BASE_URL}/upload/multiple`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`
          },
          body: galleryData
        });

        if (!resGallery.ok) {
          const errData = await resGallery.json().catch(() => ({}));
          throw new Error(errData.message || 'Erreur lors du téléversement de la galerie');
        }
        const dataGallery = await resGallery.json();
        uploadedGalleryUrls = dataGallery.urls || [];
      }

      // 4. Update Salon with image URLs
      const updateData: any = {};
      if (logoUrl) updateData.logoUrl = logoUrl;
      if (bannerUrl) updateData.bannerUrl = bannerUrl;
      if (uploadedGalleryUrls.length > 0) updateData.galleryUrls = uploadedGalleryUrls;

      if (Object.keys(updateData).length > 0) {
        const updateRes = await salonsApi.update(salonId, updateData, activeToken);
        if (!updateRes.success) {
          throw new Error(updateRes.message || 'Erreur lors de la mise à jour des images du salon');
        }
        toast({ title: 'Succès', description: 'Les images ont été enregistrées avec succès.' });
      }

      setStep('STAFF');
    } catch (err: any) {
      toast({ title: 'Erreur d\'upload', description: err.message || 'Erreur lors de l\'enregistrement des photos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.password) {
      setStaffList([...staffList, newStaff]);
      setNewStaff({ name: '', email: '', password: '', telephone: '' });
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      const activeToken = token || localStorage.getItem('token');
      if (!activeToken) {
        toast({ title: 'Erreur', description: 'Veuillez vous connecter d’abord.', variant: 'destructive' });
        setStep('AUTH');
        return;
      }
      const salonId = session?.salonId;
      if (!salonId) {
        toast({ title: 'Erreur', description: 'Salon introuvable dans la session. Veuillez reconfigurer les détails.', variant: 'destructive' });
        setStep('DETAILS');
        return;
      }
      // Envoyer la liste de staff
      for (const staff of staffList) {
        await salonsApi.addStaff(salonId, staff, activeToken);
      }
      setStep('DONE');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Erreur ajout staff', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { id: 'AUTH', label: getText('Authentification', 'Authentication') },
    { id: 'DETAILS', label: getText('Détails', 'Details') },
    { id: 'PHOTOS', label: getText('Logo', 'Logo') },
    { id: 'STAFF', label: getText('Équipe', 'Staff') },
  ];

  const currentStepIndex = stepsList.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/20 to-slate-100 dark:from-zinc-950 dark:via-rose-950/5 dark:to-zinc-900 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-accent/10 dark:bg-accent/5 blur-[120px] pointer-events-none" />

      {/* Main glass-card container */}
      <div
        className={`w-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-2xl rounded-3xl p-6 md:p-10 border border-white/20 dark:border-zinc-800/80 transition-all duration-700 ease-in-out relative z-10 ${(step === 'DETAILS' || step === 'STAFF') ? 'max-w-2xl' : 'max-w-xl'
          }`}
      >

        {/* Stepper (masqué à l'étape DONE) */}
        {step !== 'DONE' && (
          <div className="mb-8 relative">
            <div className="flex items-center justify-between">
              {stepsList.map((s, i) => (
                <div key={s.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${currentStepIndex > i
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                        : currentStepIndex === i
                          ? 'bg-gradient-to-r from-primary to-accent ring-4 ring-primary/20 text-white shadow-lg scale-110'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                  >
                    {currentStepIndex > i ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 font-semibold hidden sm:block transition-colors duration-300 ${currentStepIndex >= i ? 'text-primary' : 'text-muted-foreground'
                      }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
              {/* Ligne de progression */}
              <div className="absolute top-[18px] left-0 w-full px-8 hidden sm:block z-0 pointer-events-none">
                <div className="h-[2px] bg-muted relative w-[calc(100%-4rem)] mx-auto top-[2px]">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-in-out"
                    style={{ width: `${(Math.max(0, currentStepIndex) / (stepsList.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'AUTH' && (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/15 to-accent/15 rounded-3xl flex items-center justify-center mb-6 shadow-inner rotate-3 hover:rotate-0 transition-transform duration-300">
              <Store className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {getText('Créer votre salon', 'Create your salon')}
                </span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {getText(
                  'Découvrez la plateforme tout-en-un pour propulser votre activité de beauté et bien-être.',
                  'Discover the all-in-one platform to boost your beauty and wellness business.'
                )}
              </p>
            </div>

            {/* Google Authentication Button */}
            <div className="flex flex-col items-center justify-center pt-2 space-y-4 w-full max-w-sm mx-auto">
              <Button
                onClick={() => authApi.googleLogin()}
                className="w-full h-12 text-base font-semibold bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 shadow-md flex items-center justify-center gap-3 transition-all duration-300 rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {getText('Continuer avec Google', 'Continue with Google')}
              </Button>
              <span className="text-[11px] text-muted-foreground">
                {getText('Connexion sécurisée en un clic.', 'One-click secure login.')}
              </span>
            </div>

            {/* Highlights/Selling Points list */}
            <div className="border-t border-border/60 pt-6 mt-6 text-left max-w-sm mx-auto space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-4">
                {getText('Pourquoi choisir BeautyFlow ?', 'Why choose BeautyFlow?')}
              </h3>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{getText('Gestion Simplifiée', 'Simplified Management')}</h4>
                  <p className="text-xs text-muted-foreground">{getText('Planning interactif, rappels SMS automatiques et ventes en un clin d\'œil.', 'Interactive scheduling, automatic SMS reminders and quick sales.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{getText('Fidélisation Augmentée', 'Boosted Loyalty')}</h4>
                  <p className="text-xs text-muted-foreground">{getText('Campagnes marketing ciblées et programme de fidélité 100% personnalisable.', 'Targeted marketing campaigns and a 100% customizable loyalty program.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{getText('Analyses Détaillées', 'Detailed Analytics')}</h4>
                  <p className="text-xs text-muted-foreground">{getText('Visualisez vos revenus, dépenses et performances d\'équipe en temps réel.', 'Visualize your revenue, expenses and team performance in real time.')}</p>
                </div>
              </div>
            </div>
          </div>
        )}



        {step === 'DETAILS' && (
          <form onSubmit={handleCreateSalon} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">
                {getText('Détails du salon', 'Salon Details')}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {getText(
                  'Commençons par configurer les informations de base de votre établissement.',
                  'Let\'s start by configuring the basic details of your business.'
                )}
              </p>
            </div>

            <div className="space-y-5">
              {/* Section 1: Informations Générales */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                  <span>📋</span>
                  {getText('Informations de base', 'Basic Information')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="details-name" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Nom du salon *', 'Salon name *')}
                    </Label>
                    <Input
                      id="details-name"
                      required
                      placeholder="Ex: Neyo Hair Studio"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-slogan" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Slogan (Facultatif)', 'Slogan (Optional)')}
                    </Label>
                    <Input
                      id="details-slogan"
                      placeholder="Ex: L'art de sublimer votre beauté"
                      value={form.slogan}
                      onChange={e => setForm({ ...form, slogan: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="details-type" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Type d\'établissement', 'Establishment Type')}
                    </Label>
                    <select
                      id="details-type"
                      className="flex h-11 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.typeEtablissement}
                      onChange={e => setForm({ ...form, typeEtablissement: e.target.value })}
                    >
                      <option value="salon_coiffure">{getText('Salon de coiffure', 'Hair Salon')}</option>
                      <option value="spa">{getText('Spa & Bien-être', 'Spa & Wellness')}</option>
                      <option value="institut_beaute">{getText('Institut de beauté', 'Beauty Institute')}</option>
                      <option value="barbershop">{getText('Barbershop / Barbier', 'Barbershop')}</option>
                      <option value="onglerie">{getText('Onglerie / Bar à ongles', 'Nail Salon')}</option>
                      <option value="mixte">{getText('Salon mixte / complet', 'Mixed Salon')}</option>
                      <option value="autre">{getText('Autre service', 'Other')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details-hours" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Horaires d\'ouverture', 'Opening Hours')}
                    </Label>
                    <Input
                      id="details-hours"
                      placeholder="Ex: Lun-Sam: 9h - 19h"
                      value={form.horaires}
                      onChange={e => setForm({ ...form, horaires: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Localisation */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                  <span>📍</span>
                  {getText('Localisation & Contact', 'Location & Contact')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="details-phone" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Téléphone pro *', 'Pro phone *')}
                    </Label>
                    <Input
                      id="details-phone"
                      required
                      placeholder="+237 6 12 34 56 78"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-email" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Email pro *', 'Pro email *')}
                    </Label>
                    <Input
                      id="details-email"
                      type="email"
                      required
                      placeholder="contact@mon-salon.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="details-ville" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Ville', 'City')}
                    </Label>
                    <Input
                      id="details-ville"
                      required
                      placeholder="Douala"
                      value={form.ville}
                      onChange={e => setForm({ ...form, ville: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="details-address" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Adresse exacte *', 'Exact Address *')}
                    </Label>
                    <Input
                      id="details-address"
                      required
                      placeholder="Rue des palmiers, Bonapriso"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="details-pays" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Pays', 'Country')}
                    </Label>
                    <select
                      id="details-pays"
                      className="flex h-11 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.pays}
                      onChange={e => setForm({ ...form, pays: e.target.value })}
                    >
                      <option value="CM">{getText('Cameroun (CM)', 'Cameroon (CM)')}</option>
                      <option value="CI">{getText('Côte d\'Ivoire (CI)', 'Ivory Coast (CI)')}</option>
                      <option value="SN">{getText('Sénégal (SN)', 'Senegal (SN)')}</option>
                      <option value="GA">{getText('Gabon (GA)', 'Gabon (GA)')}</option>
                      <option value="CG">{getText('Congo (CG)', 'Congo (CG)')}</option>
                      <option value="FR">{getText('France (FR)', 'France (FR)')}</option>
                      <option value="BE">{getText('Belgique (BE)', 'Belgium (BE)')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="details-devise" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      {getText('Devise monétaire', 'Currency')}
                    </Label>
                    <select
                      id="details-devise"
                      className="flex h-11 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={form.devise}
                      onChange={e => setForm({ ...form, devise: e.target.value })}
                    >
                      <option value="FCFA">FCFA (Franc CFA)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Description */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="details-description" className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  {getText('Description', 'Description')}
                </Label>
                <Textarea
                  id="details-description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="bg-muted/30 resize-none focus-visible:ring-primary h-24"
                  placeholder={getText(
                    'Présentez votre salon en quelques mots (prestations, spécialités, ambiance)...',
                    'Describe your salon in a few words (services, specialties, mood)...'
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {getText('Continuer vers le logo', 'Continue to logo')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        )}

        {step === 'PHOTOS' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-3">
                <Camera className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {getText('Logo et Identité Visuelle', 'Logo and Visual Identity')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                {getText(
                  "Personnalisez votre salon avec un logo, une bannière et des photos pour donner envie à vos clientes de réserver.",
                  "Personalize your salon with a logo, banner and photos to make your clients want to book."
                )}
              </p>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {getText('Téléversement des fichiers en cours...', 'Uploading files in progress...')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getText('Veuillez patienter pendant l\'optimisation et l\'envoi vers le cloud.', 'Please wait while optimizing and sending to the cloud.')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Logo Card */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{getText('Logo du salon', 'Salon Logo')}</Label>
                    <div className="group relative h-40 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/10 transition-all rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden p-3 bg-muted/5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setLogoFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="text-center space-y-1.5 pointer-events-none">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                          <Camera className="h-4.5 w-4.5" />
                        </div>
                        {logoFile ? (
                          <div className="text-xs font-semibold text-primary truncate max-w-[180px]">{logoFile.name}</div>
                        ) : (
                          <>
                            <span className="text-xs font-medium block text-zinc-700 dark:text-zinc-300">{getText('Téléverser le logo', 'Upload Logo')}</span>
                            <span className="text-[10px] text-muted-foreground block">{getText('Format carré conseillé', 'Square format suggested')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner Card */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{getText('Bannière du salon', 'Salon Banner')}</Label>
                    <div className="group relative h-40 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/10 transition-all rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden p-3 bg-muted/5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setBannerFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="text-center space-y-1.5 pointer-events-none">
                        <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent group-hover:scale-110 transition-transform">
                          <Camera className="h-4.5 w-4.5" />
                        </div>
                        {bannerFile ? (
                          <div className="text-xs font-semibold text-accent truncate max-w-[180px]">{bannerFile.name}</div>
                        ) : (
                          <>
                            <span className="text-xs font-medium block text-zinc-700 dark:text-zinc-300">{getText('Téléverser la bannière', 'Upload Banner')}</span>
                            <span className="text-[10px] text-muted-foreground block">{getText('Format horizontal 16:9', 'Landscape 16:9 format')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery Dropzone */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">{getText('Galerie photos du salon', 'Salon Photo Gallery')}</Label>
                  <div className="group relative py-6 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/10 transition-all rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-muted/5">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setGalleryFiles(files);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center space-y-2 pointer-events-none px-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      {galleryFiles.length > 0 ? (
                        <div className="text-sm font-semibold text-primary">
                          {getText(`${galleryFiles.length} photo(s) sélectionnée(s)`, `${galleryFiles.length} photo(s) selected`)}
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {getText('Glissez vos photos de réalisations ou cliquez pour ajouter', 'Drag gallery photos or click to add')}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {getText('Ajoutez jusqu\'à 10 photos marquantes', 'Add up to 10 highlights')}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handlePhotoUpload}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white shadow-md shadow-primary/20"
                  >
                    {getText('Continuer vers l\'équipe', 'Continue to staff')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setStep('STAFF')}
                    className="w-full hover:bg-muted font-medium text-zinc-500"
                  >
                    {getText('Passer cette étape', 'Skip this step')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'STAFF' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {getText('Votre Équipe', 'Your Staff')}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {getText(
                  "Ajoutez des collaborateurs pour leur attribuer des rendez-vous. Vous pouvez aussi le faire plus tard.",
                  "Add staff members to assign bookings to them. You can also do this later."
                )}
              </p>
            </div>

            <div className={`grid grid-cols-1 ${staffList.length > 0 ? 'md:grid-cols-2' : ''} gap-6`}>
              {/* Form card */}
              <div className="space-y-4 border border-border/85 p-5 rounded-2xl bg-muted/10 shadow-sm flex flex-col justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5 flex items-center gap-1">
                  <span>➕</span>
                  {getText('Ajouter un membre', 'Add a member')}
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="staff-name" className="text-xs font-bold text-zinc-500">{getText('Nom', 'Name')}</Label>
                    <Input
                      id="staff-name"
                      placeholder="Ex: Sarah"
                      value={newStaff.name}
                      onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                      className="bg-background h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="staff-email" className="text-xs font-bold text-zinc-500">{getText('Email professionnel', 'Pro Email')}</Label>
                    <Input
                      id="staff-email"
                      placeholder="sarah@salon.com"
                      type="email"
                      value={newStaff.email}
                      onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                      className="bg-background h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="staff-password" className="text-xs font-bold text-zinc-500">{getText('Mot de passe', 'Password')}</Label>
                    <Input
                      id="staff-password"
                      placeholder="Ex: ••••••••"
                      type="password"
                      value={newStaff.password}
                      onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                      className="bg-background h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="staff-phone" className="text-xs font-bold text-zinc-500">{getText('Téléphone', 'Phone')}</Label>
                    <Input
                      id="staff-phone"
                      placeholder="06 12 34 56 78"
                      value={newStaff.telephone}
                      onChange={e => setNewStaff({ ...newStaff, telephone: e.target.value })}
                      className="bg-background h-10"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddStaff}
                  variant="secondary"
                  className="w-full mt-4 h-10 font-semibold bg-zinc-200 hover:bg-zinc-300 text-zinc-800"
                >
                  {getText('Ajouter à la liste', 'Add to list')}
                </Button>
              </div>

              {/* Added staff list */}
              {staffList.length > 0 && (
                <div className="space-y-4 border border-border/80 p-5 rounded-2xl bg-primary/5 shadow-sm flex flex-col">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/40 pb-1.5 flex items-center gap-1.5">
                    <span>👥</span>
                    {getText(`Liste de l'équipe (${staffList.length})`, `Team List (${staffList.length})`)}
                  </h3>
                  <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
                    {staffList.map((s, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm font-medium bg-white dark:bg-zinc-850 p-3 rounded-xl shadow-sm border border-border/50 animate-in slide-in-from-right-3 duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{s.name}</span>
                            <span className="text-muted-foreground text-[10px] truncate">{s.email}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStaffList(staffList.filter((_, idx) => idx !== i))}
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={finishOnboarding}
              disabled={loading}
              className="w-full h-12 text-base font-semibold shadow-md bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white flex items-center justify-center gap-2 mt-6 animate-pulse"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              {getText('Terminer la configuration', 'Finish configuration')}
            </Button>
          </div>
        )}

        {step === 'DONE' && (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-500 py-8">
            <div className="relative mx-auto w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center mb-6 shadow-lg border border-emerald-300 dark:from-emerald-950 dark:to-green-900 dark:border-emerald-800">
              <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute bottom-2 left-0 w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                {getText('Félicitations !', 'Congratulations!')}
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                {getText(
                  "Votre salon est maintenant configuré avec succès. Préparez-vous à gérer votre espace pro en toute sérénité !",
                  "Your salon has been successfully configured. Get ready to manage your pro space with complete peace of mind!"
                )}
              </p>
            </div>

            {/* Display staff credentials for sharing */}
            {staffList.length > 0 && (
              <div className="border border-emerald-100 dark:border-emerald-950/80 bg-emerald-50/20 dark:bg-emerald-950/5 p-5 rounded-2xl text-left space-y-3 max-w-md mx-auto">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  {getText("Identifiants de votre équipe à transmettre :", "Your team's login credentials to share:")}
                </h4>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {staffList.map((s, i) => (
                    <div key={i} className="text-xs bg-white/80 dark:bg-zinc-900/80 border border-border/80 p-3 rounded-xl flex justify-between items-center gap-2 shadow-sm">
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{s.name}</span>
                        <span className="text-muted-foreground text-[10px] truncate">{s.email}</span>
                      </div>
                      <div className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg font-mono flex items-center gap-1.5 border border-border/40 shrink-0">
                        <span className="text-zinc-700 dark:text-zinc-300 select-all font-semibold">{s.password}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                localStorage.removeItem('onboarding_step');
                window.location.href = '/dashboard';
              }}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 rounded-xl"
            >
              {getText('Aller au tableau de bord', 'Go to dashboard')}
              <ArrowRight className="h-5 w-5 animate-pulse" />
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
