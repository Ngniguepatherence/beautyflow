import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Building2, CheckCircle, XCircle, RefreshCw, LogOut, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getSalonAccounts, renewSalonSubscription, toggleSalonActive, isSalonSubscriptionActive } from '@/lib/auth';
import { SalonAccount } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { StatCard } from '@/components/dashboard/StatCard';
import CreateSalonDialog from '@/components/admin/CreateSalonDialog';
import SalonCard from '@/components/admin/SalonCard';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CM', { style: 'decimal', minimumFractionDigits: 0 }).format(amount) + ' FCFA';
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [salons, setSalons] = useState<SalonAccount[]>(getSalonAccounts);
  const [dialogOpen, setDialogOpen] = useState(false);

  const refresh = () => setSalons(getSalonAccounts());

  const handleRenew = (id: string) => {
    renewSalonSubscription(id);
    toast({ title: 'Abonnement renouvelé pour 30 jours' });
    refresh();
  };

  const handleToggle = (id: string, active: boolean) => {
    toggleSalonActive(id, active);
    toast({ title: active ? 'Salon activé' : 'Salon désactivé' });
    refresh();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const activeSalons = salons.filter(s => isSalonSubscriptionActive(s));
  const revenuMensuel = activeSalons.length * 25000;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-foreground flex items-center justify-center">
              <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-background" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-lg text-foreground">LeaderBright Admin</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Gestion des salons</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Déconnexion</span>
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatCard title="Total Salons" value={salons.length} icon={Building2} variant="primary" />
          <StatCard title="Salons Actifs" value={activeSalons.length} icon={CheckCircle} variant="success" />
          <StatCard title="Salons Expirés" value={salons.length - activeSalons.length} icon={XCircle} variant="warning" />
          <StatCard title="Revenu Mensuel" value={formatCurrency(revenuMensuel)} icon={TrendingUp} variant="accent" />
        </div>

        {/* Salon list */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                Salons enregistrés
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{salons.length} salon(s)</CardDescription>
            </div>
            <CreateSalonDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              existingEmails={salons.map(s => s.email)}
              onCreated={refresh}
            />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {salons.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm sm:text-base">Aucun salon enregistré</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Créez votre premier salon pour commencer</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {salons.map(salon => (
                  <SalonCard
                    key={salon.id}
                    salon={salon}
                    onRenew={handleRenew}
                    onToggle={handleToggle}
                    onRefresh={refresh}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
