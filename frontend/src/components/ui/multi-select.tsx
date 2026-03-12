import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Select...', className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value]);
  };

  const remove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-auto min-h-10 font-normal', className)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <Badge key={val} variant="secondary" className="text-xs">
                  {opt?.label || val}
                  <button className="ml-1 rounded-full outline-none" onClick={(e) => remove(val, e)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-1 max-h-60 overflow-y-auto" align="start">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className={cn(
              'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
              selected.includes(opt.value) ? 'bg-primary text-primary-foreground' : 'opacity-50'
            )}>
              {selected.includes(opt.value) && <Check className="h-3 w-3" />}
            </div>
            {opt.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
