/**
 * Modal de confirmación para acción de matar proceso
 * Evita terminaciones accidentales
 */

interface ConfirmDialogProps {
  isOpen: boolean;
  processName: string;
  port: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  processName,
  port,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative card max-w-md w-full animate-slide-up shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
       <div className="w-12 h-12 rounded-full bg-danger-500/20 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-danger-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-dark-50">
            Confirmar Acción
          </h3>
        </div>

        <p className="text-dark-300 mb-2">
          ¿Estás seguro que deseas finalizar este proceso?
        </p>

        <div className="bg-dark-900 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-dark-400">Proceso:</span>
            <span className="text-dark-100 font-mono">{processName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Puerto:</span>
            <span className="text-dark-100 font-mono">{port}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn flex-1 bg-dark-700 hover:bg-dark-600 text-dark-100"
          >
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-danger flex-1">
            Sí, Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
