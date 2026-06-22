import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Scissors, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePrestations } from '@/hooks/usePrestations';
import { useClients } from '@/hooks/useClients';
import { TypePrestation } from '@/types';
import { TypePrestationForm } from '@/components/prestations/TypePrestationForm';
import { NouvellePrestation } from '@/components/prestations/NouvellePrestation';
import { CalendrierRendezVous } from '@/components/prestations/CalendrierRendezVous';
import { getCategoryImage } from '@/lib/category-images';
import { useLanguage } from '@/contexts/LanguageContext';
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export default function Prestations() {
  const { typesPrestations, prestations, addTypePrestation, updateTypePrestation, deleteTypePrestation, getTypePrestation } = usePrestations();
  const { getClient } = useClients();
  const { t } = useLanguage();
  const [showAddType, setShowAddType] = useState(false);
  const [editingType, setEditingType] = useState<TypePrestation | null>(null);
  const [showNouvellePrestation, setShowNouvellePrestation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null);

  const handleAddType = (data: Omit<TypePrestation, 'id'>) => {
    addTypePrestation(data);
    setShowAddType(false);
  };

  const handleEditType = (data: Partial<TypePrestation>) => {
    if (editingType) {
      updateTypePrestation(editingType.id, data);
      setEditingType(null);
    }
  };

  const handleDeleteType = (id: string) => {
    if (confirm(t('services.deleteConfirm'))) {
      deleteTypePrestation(id);
    }
  };

  const categories = [...new Set(typesPrestations.map(t => t.categorie).filter(Boolean))] as string[];

  const filteredTypes = selectedCategorie
    ? typesPrestations.filter(t => t.categorie === selectedCategorie)
    : typesPrestations;

  const recentPrestations = [...prestations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{t('services.title')}</h1>
          <p className="text-muted-foreground">{typesPrestations.length} {t('services.types')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddType(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            {t('services.newType')}
          </Button>
          <Button onClick={() => setShowNouvellePrestation(true)} className="gradient-primary">
            <Scissors className="h-4 w-4 mr-2" />
            {t('services.register')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="catalogue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalogue">{t('services.catalog')}</TabsTrigger>
          <TabsTrigger value="calendrier" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {t('services.appointments')}
          </TabsTrigger>
          <TabsTrigger value="historique">{t('services.history')}</TabsTrigger>
        </TabsList>

        {/* Catalogue with photos */}
        <TabsContent value="catalogue" className="space-y-6">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategorie === null ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 text-sm"
              onClick={() => setSelectedCategorie(null)}
            >
              Tout
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategorie === cat ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setSelectedCategorie(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Category hero cards */}
          {selectedCategorie === null && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const count = typesPrestations.filter(t => t.categorie === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategorie(cat)}
                    className="group relative overflow-hidden rounded-2xl aspect-[4/3] card-shadow transition-transform hover:scale-[1.02]"
                  >
                    <img
                      src={getCategoryImage(cat)}
                      alt={cat}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                      <h3 className="font-bold text-white text-lg">{cat}</h3>
                      <p className="text-white/80 text-sm">{count} prestation{count > 1 ? 's' : ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Service cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTypes.map((type) => (
              <Card key={type.id} className="card-shadow overflow-hidden group">
                {/* Photo header */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={getCategoryImage(type.categorie)}
                    alt={type.nom}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {type.categorie && (
                    <Badge className="absolute top-3 left-3 bg-white/90 text-foreground hover:bg-white/90 text-xs">
                      {type.categorie}
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/80 hover:bg-white text-foreground"
                      onClick={() => setEditingType(type)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/80 hover:bg-white text-destructive"
                      onClick={() => handleDeleteType(type.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground text-base">{type.nom}</h3>
                  {type.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{type.description}</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(type.prix)}
                    </span>
                    <Button
                      size="sm"
                      className="gradient-primary text-xs"
                      onClick={() => setShowNouvellePrestation(true)}
                    >
                      Réserver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendrier">
          <CalendrierRendezVous />
        </TabsContent>

        {/* History */}
        <TabsContent value="historique" className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Recent prestations */}
          <Card>
            <CardHeader>
              <CardTitle>Prestations récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPrestations.length > 0 ? (
                <div className="space-y-3">
                  {recentPrestations.map((prestation) => {
                    const type = getTypePrestation(prestation.typePrestationId);
                    const client = getClient(prestation.clientId);
                    return (
                      <div key={prestation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={getCategoryImage(type?.categorie)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{type?.nom || 'Prestation inconnue'}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {client?.nom || 'Cliente inconnue'} • {new Date(prestation.date).toLocaleDateString('fr-FR')}
                              {prestation.employe && ` • Par ${prestation.employe}`}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-primary whitespace-nowrap ml-3">
                          {formatCurrency(prestation.montant)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Aucune prestation enregistrée</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Type Dialog */}
      <Dialog open={showAddType} onOpenChange={setShowAddType}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau type de prestation</DialogTitle>
          </DialogHeader>
          <TypePrestationForm onSubmit={handleAddType} onCancel={() => setShowAddType(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Type Dialog */}
      <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le type de prestation</DialogTitle>
          </DialogHeader>
          {editingType && (
            <TypePrestationForm
              type={editingType}
              onSubmit={handleEditType}
              onCancel={() => setEditingType(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Nouvelle Prestation Dialog */}
      <Dialog open={showNouvellePrestation} onOpenChange={setShowNouvellePrestation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer une prestation</DialogTitle>
          </DialogHeader>
          <NouvellePrestation onClose={() => setShowNouvellePrestation(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
