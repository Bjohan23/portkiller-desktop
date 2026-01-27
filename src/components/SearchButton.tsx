/**
 * Componente de botón de búsqueda
 * Con estados de loading y deshabilitado
 */

import { Search, Loader2 } from 'lucide-react';

interface SearchButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SearchButton({
  onClick,
  loading = false,
  disabled = false,
}: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-primary w-full sm:w-auto min-w-[120px] flex items-center justify-center gap-2 transition-all duration-200 ${
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Buscando...</span>
        </>
      ) : (
        <>
          <Search className="h-5 w-5" />
          <span>Buscar</span>
        </>
      )}
    </button>
  );
}
