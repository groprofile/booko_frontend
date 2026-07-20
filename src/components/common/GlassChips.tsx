import React from 'react';

export interface GlassChipOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface GlassChipsProps {
  options: GlassChipOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  singleSelect?: boolean;
}

export default function GlassChips({ options, selectedIds, onChange, singleSelect = false }: GlassChipsProps) {
  const toggleChip = (id: string) => {
    if (singleSelect) {
      onChange([id]);
    } else {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter(selectedId => selectedId !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        
        return (
          <button
            key={option.id}
            onClick={() => toggleChip(option.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              backdrop-blur-md border shadow-sm
              ${isSelected 
                ? 'bg-brand/10 border-brand text-brand shadow-soft' 
                : 'bg-white/60 border-white/40 text-secondary-text hover:bg-white/80'}
            `}
          >
            {option.icon && (
              <span className={isSelected ? 'text-brand' : 'text-muted-text'}>
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
