import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Prestation } from '@/types';

interface RevenueChartProps {
  prestations: Prestation[];
}

export function RevenueChart({ prestations }: RevenueChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { name: string; revenus: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const revenus = prestations
        .filter(p => p.date.startsWith(key))
        .reduce((s, p) => s + p.montant, 0);
      months.push({
        name: d.toLocaleDateString('fr-FR', { month: 'short' }),
        revenus,
      });
    }
    return months;
  }, [prestations]);

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Revenus (6 mois)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(350, 65%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(350, 65%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 25%, 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(340, 15%, 45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(340, 15%, 45%)" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Revenus']}
                contentStyle={{ borderRadius: '0.75rem', border: '1px solid hsl(30, 25%, 88%)' }}
              />
              <Area type="monotone" dataKey="revenus" stroke="hsl(350, 65%, 55%)" fill="url(#colorRevenus)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
