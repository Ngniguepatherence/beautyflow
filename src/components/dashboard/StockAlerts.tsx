import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Produit } from '@/types';

interface StockAlertsProps {
  produits: Produit[];
}

export function StockAlerts({ produits }: StockAlertsProps) {
  return (
    <Card className="card-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertes stock
          {produits.length > 0 && (
            <Badge className="bg-warning/20 text-warning border-0 ml-1">{produits.length}</Badge>
          )}
        </CardTitle>
        <Link to="/stock">
          <Button variant="ghost" size="sm">
            Stock <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {produits.length > 0 ? (
          <div className="space-y-2">
            {produits.slice(0, 5).map(p => {
              const isOut = p.quantite === 0;
              return (
                <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isOut ? 'bg-destructive/5 border-destructive/20' : 'bg-warning/5 border-warning/20'}`}>
                  <Package className={`h-5 w-5 shrink-0 ${isOut ? 'text-destructive' : 'text-warning'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{p.nom}</p>
                    <p className="text-xs text-muted-foreground">{p.categorie}</p>
                  </div>
                  <Badge className={`shrink-0 border-0 ${isOut ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}`}>
                    {p.quantite}/{p.seuilAlerte}
                  </Badge>
                </div>
              );
            })}
            {produits.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">+{produits.length - 5} autres produits</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-success font-medium">✓ Stock en ordre</p>
            <p className="text-xs text-muted-foreground mt-1">Tous les produits sont au-dessus du seuil</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
