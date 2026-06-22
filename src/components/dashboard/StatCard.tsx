import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variants = {
    default: 'bg-card',
    primary: 'bg-primary/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    accent: 'bg-accent/10',
  };

  const iconVariants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    accent: 'bg-accent text-accent-foreground',
  };

  return (
    <div className={cn(
      'rounded-xl p-5 card-shadow border border-border animate-fade-in',
      variants[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              'text-xs font-medium mt-2',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mois dernier
            </p>
          )}
        </div>
        <div className={cn(
          'h-12 w-12 rounded-xl flex items-center justify-center',
          iconVariants[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
