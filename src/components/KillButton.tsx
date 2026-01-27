/**
 * Botón para matar proceso
 * Solo visible cuando el puerto está en uso
 */

interface KillButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function KillButton({
  onClick,
  loading = false,
  disabled = false,
}: KillButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-danger w-full mt-6 flex items-center justify-center gap-2"
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
          <span>Terminando proceso...</span>
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Finalizar Proceso</span>
        </>
      )}
    </button>
  );
}
