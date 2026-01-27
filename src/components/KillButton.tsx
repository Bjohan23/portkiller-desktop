/**
 * Botón para matar proceso
 * Solo visible cuando el puerto está en uso
 */

import { XCircle, Loader2 } from 'lucide-react';

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
      className={`btn-danger w-full mt-6 flex items-center justify-center gap-2 transition-all duration-200 ${
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Terminando proceso...</span>
        </>
      ) : (
        <>
          <XCircle className="h-5 w-5" />
          <span>Finalizar Proceso</span>
        </>
      )}
    </button>
  );
}
