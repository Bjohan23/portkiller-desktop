/**
 * Componente de botón de búsqueda
 * Con estados de loading y deshabilitado
 */

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
      className="btn-primary w-full sm:w-auto min-w-[120px] flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg
            className="animate-spin-slow h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Buscando...</span>
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span>Buscar</span>
        </>
      )}
    </button>
  );
}
