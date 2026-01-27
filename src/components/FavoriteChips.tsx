import { Star } from 'lucide-react';

interface FavoriteChipsProps {
  onSelect: (port: string) => void;
  disabled?: boolean;
}

const COMMON_PORTS = ['3000', '3001', '5173', '8000', '8080', '9229'];

export function FavoriteChips({ onSelect, disabled = false }: FavoriteChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1 w-full">
        <Star className="w-3 h-3 text-primary-500" />
        Favoritos Rápidos
      </div>
      {COMMON_PORTS.map((port) => (
        <button
          key={port}
          onClick={() => onSelect(port)}
          disabled={disabled}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
            border border-dark-700 bg-dark-800/50 text-dark-300
            hover:border-primary-500/50 hover:text-primary-500 hover:bg-primary-500/5
            active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {port}
        </button>
      ))}
    </div>
  );
}
