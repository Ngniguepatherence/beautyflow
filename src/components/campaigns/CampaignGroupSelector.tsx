import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CampaignGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
  description?: string;
}

interface CampaignGroupSelectorProps {
  groups: CampaignGroup[];
  selectedGroups: string[];
  onToggleGroup: (groupId: string) => void;
}

export function CampaignGroupSelector({ 
  groups, 
  selectedGroups, 
  onToggleGroup 
}: CampaignGroupSelectorProps) {
  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const Icon = group.icon;
        const isSelected = selectedGroups.includes(group.id);
        
        return (
          <div
            key={group.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
              isSelected 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
            onClick={() => onToggleGroup(group.id)}
          >
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isSelected} 
                className="pointer-events-none"
              />
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                isSelected ? "bg-primary/20" : "bg-muted"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium">{group.label}</p>
                {group.description && (
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                )}
              </div>
            </div>
            <span className={cn(
              "text-sm font-semibold px-2 py-1 rounded-full transition-colors",
              isSelected 
                ? "bg-primary/20 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {group.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
