import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn('flex items-center bg-muted rounded-lg p-0.5', className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-7 px-2.5 text-xs font-medium rounded-md transition-all',
          language === 'fr' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setLanguage('fr')}
      >
        FR
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-7 px-2.5 text-xs font-medium rounded-md transition-all',
          language === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
    </div>
  );
}
