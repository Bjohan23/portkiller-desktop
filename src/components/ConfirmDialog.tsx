import { AlertTriangle } from 'lucide-react';

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
      <div className="relative card max-w-md w-full animate-slide-up shadow-2xl border border-dark-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-danger-500/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-danger-500" />
          </div>
          <h3 className="text-xl font-semibold text-dark-50">
            Confirmar Acción
          </h3>
        </div>

        <p className="text-dark-300 mb-2">
          ¿Estás seguro que deseas finalizar este proceso? Esto podría causar pérdida de datos no guardados.
        </p>

        <div className="bg-dark-900/50 rounded-lg p-4 mb-6 space-y-2 border border-dark-800">
          <div className="flex justify-between items-center">
            <span className="text-dark-400 text-sm">Proceso:</span>
            <span className="text-dark-100 font-mono font-medium">{processName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-dark-400 text-sm">Puerto:</span>
            <span className="text-dark-100 font-mono font-medium">{port}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn flex-1 bg-dark-700 hover:bg-dark-600 text-dark-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="btn-danger flex-1 py-2 rounded-md font-medium hover:bg-danger-600 transition-colors"
          >
            Sí, Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
