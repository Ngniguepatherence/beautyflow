import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ServicesPieChartProps {
  data: { nom: string; count: number }[];
}

const COLORS = [
  'hsl(350, 65%, 55%)',
  'hsl(35, 80%, 55%)',
  'hsl(145, 60%, 45%)',
  'hsl(200, 80%, 50%)',
  'hsl(280, 50%, 55%)',
];

export function ServicesPieChart({ data }: ServicesPieChartProps) {
  if (data.length === 0) {
    return (
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Répartition prestations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Scissors className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Aucune donnée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          Répartition prestations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="nom" cx="50%" cy="50%" outerRadius={70} strokeWidth={2}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}x`, 'Visites']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2 w-full">
            {data.map((item, i) => (
              <div key={item.nom} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate flex-1 text-foreground">{item.nom}</span>
                <span className="font-medium text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
