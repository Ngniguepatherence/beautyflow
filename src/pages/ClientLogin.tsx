import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowLeft, Phone, Heart, Calendar, Bookmark, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { toast } from '@/hooks/use-toast';

export default function ClientLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/explorer';
  const { signin, signup, googleLogin } = useClientAuth();

  const [isRegister, setIsRegister] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ nom: '', email: '', password: '', telephone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const r = await signin(loginForm.email, loginForm.password);
    setLoading(false);
    if (r.ok) { 
      toast({ title: 'Bienvenue de retour ! ✨' }); 
      navigate(redirect); 
    } else {
      setError((r as { reason: string }).reason);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const r = await signup({ nom: regForm.nom, email: regForm.email, password: regForm.password, telephone: regForm.telephone });
    setLoading(false);
    if (r.ok) { 
      toast({ title: 'Compte créé ✨', description: 'Bienvenue dans l\'univers BeautyFlow !' }); 
      navigate(redirect); 
    } else {
      setError((r as { reason: string }).reason);
    }
  };

  const handleGoogleMock = async () => {
    setError('');
    setLoading(true);
    // On simule un token google. Le backend captera "mock-*" pour générer un faux payload
    const r = await googleLogin('mock-' + Math.random().toString(36).substring(7));
    setLoading(false);
    if (r.ok) {
      toast({ title: 'Connexion Google réussie ! 🚀', description: 'Heureux de vous voir.' });
      navigate(redirect);
    } else {
      setError((r as { reason: string }).reason);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Pane - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply" />
        <img 
          src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2070&auto=format&fit=crop" 
          alt="Beauty Background" 
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        <div className="relative z-20 text-center text-white px-12 max-w-xl">
          <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 text-white drop-shadow-md">
            Révélez votre <span className="text-primary-300">Beauté</span>
          </h1>
          <p className="text-lg text-white/90 leading-relaxed drop-shadow">
            Rejoignez la plus grande communauté beauté d'Afrique. 
            Réservez vos soins, cumulez des points de fidélité et profitez d'offres exclusives.
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-6 text-left">
            {[
              { icon: Heart, t: 'Favoris', d: 'Vos salons préférés' },
              { icon: Calendar, t: 'Rendez-vous', d: 'Gestion simplifiée' },
              { icon: Bookmark, t: 'Historique', d: 'Vos précédents soins' }
            ].map(f => (
              <div key={f.t} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                <f.icon className="h-6 w-6 text-primary-200 mb-3" />
                <div className="font-semibold text-white">{f.t}</div>
                <div className="text-xs text-white/70 mt-1">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile background decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 lg:hidden" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px] -z-10 lg:hidden" />

        <div className="w-full max-w-[420px] animate-fade-in-up">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="absolute top-6 left-6 gap-2 text-muted-foreground hover:text-foreground transition-colors z-50">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>

          <div className="mb-8 mt-12 lg:mt-0 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {isRegister ? 'Créer un compte ✨' : 'Bon retour 👋'}
            </h2>
            <p className="text-muted-foreground">
              {isRegister 
                ? 'Remplissez les informations ci-dessous pour nous rejoindre.' 
                : 'Connectez-vous pour accéder à votre espace personnel.'}
            </p>
          </div>

          <div className="space-y-6">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 relative overflow-hidden group hover:border-primary/50 transition-colors"
              onClick={handleGoogleMock}
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
                Continuer avec Google
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">Ou avec votre email</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                {error}
              </div>
            )}

            {!isRegister ? (
              <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-500">
                <Field 
                  icon={Mail} 
                  label="Adresse Email" 
                  type="email" 
                  value={loginForm.email} 
                  onChange={v => setLoginForm({ ...loginForm, email: v })} 
                  placeholder="vous@email.com" 
                />
                <Field 
                  icon={Lock} 
                  label="Mot de passe" 
                  type="password" 
                  value={loginForm.password} 
                  onChange={v => setLoginForm({ ...loginForm, password: v })} 
                  placeholder="••••••••" 
                />
                
                <div className="flex items-center justify-end">
                  <button type="button" className="text-xs font-medium text-primary hover:underline">Mot de passe oublié ?</button>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold gradient-primary shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-500">
                <Field 
                  icon={User} 
                  label="Nom complet" 
                  value={regForm.nom} 
                  onChange={v => setRegForm({ ...regForm, nom: v })} 
                  placeholder="Ex: Marie Nguema" 
                />
                <Field 
                  icon={Mail} 
                  label="Adresse Email" 
                  type="email" 
                  value={regForm.email} 
                  onChange={v => setRegForm({ ...regForm, email: v })} 
                  placeholder="vous@email.com" 
                />
                <Field 
                  icon={Phone} 
                  label="Numéro WhatsApp (optionnel)" 
                  type="tel" 
                  value={regForm.telephone} 
                  onChange={v => setRegForm({ ...regForm, telephone: v })} 
                  placeholder="+237 6XX XXX XXX" 
                />
                <Field 
                  icon={Lock} 
                  label="Mot de passe" 
                  type="password" 
                  value={regForm.password} 
                  onChange={v => setRegForm({ ...regForm, password: v })} 
                  placeholder="Min 6 caractères" 
                />

                <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold gradient-primary shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98] mt-2">
                  {loading ? 'Création...' : 'Créer mon compte'}
                </Button>
              </form>
            )}

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {isRegister ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}
                <button 
                  type="button" 
                  onClick={() => setIsRegister(!isRegister)}
                  className="ml-1.5 font-semibold text-primary hover:underline transition-all"
                >
                  {isRegister ? 'Connectez-vous' : 'Inscrivez-vous'}
                </button>
              </p>
            </div>
            
            <p className="text-center text-[10px] text-muted-foreground/60 mt-8 max-w-xs mx-auto">
              En continuant, vous acceptez nos <span className="underline cursor-pointer">Conditions d'utilisation</span> et notre <span className="underline cursor-pointer">Politique de confidentialité</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type = 'text', placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground/80">{label}</Label>
      <div className="relative group">
        <Icon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
          className="pl-10 h-12 bg-muted/40 border-border/50 focus-visible:bg-background rounded-xl text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/20" 
          required
        />
      </div>
    </div>
  );
}