import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

interface GlassSearchProps {
  onSearch?: (query: string, location: string) => void;
  onFilterClick?: () => void;
}

export default function GlassSearch({ onSearch, onFilterClick }: GlassSearchProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query, location);
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-8 relative z-10">
      <form 
        onSubmit={handleSubmit}
        className="glass-panel rounded-full p-2 flex flex-col md:flex-row items-center gap-2 shadow-float"
      >
        <div className="flex-1 flex items-center px-4 w-full md:w-auto border-b md:border-b-0 md:border-r border-border/50 pb-2 md:pb-0">
          <Search className="w-5 h-5 text-muted-text mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search for workspaces..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-primary-text placeholder-muted-text py-2"
          />
        </div>
        
        <div className="flex-1 flex items-center px-4 w-full md:w-auto pb-2 md:pb-0">
          <MapPin className="w-5 h-5 text-muted-text mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Location, City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-primary-text placeholder-muted-text py-2"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto px-2 md:px-0">
          {onFilterClick && (
            <button 
              type="button"
              onClick={onFilterClick}
              className="p-3 text-secondary-text hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
              aria-label="Filters"
            >
              <Filter className="w-5 h-5" />
            </button>
          )}
          <button 
            type="submit"
            className="flex-1 md:flex-none px-8 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-deep transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
