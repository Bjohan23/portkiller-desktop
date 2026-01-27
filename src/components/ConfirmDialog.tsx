import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  processName: string;
  port: number;
  isSystemProcess?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  processName,
  port,
  isSystemProcess = false,
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
      <div className={`relative card max-w-md w-full animate-slide-up shadow-2xl border ${isSystemProcess ? 'border-warning-500/50' : 'border-dark-700'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSystemProcess ? 'bg-warning-500/20' : 'bg-danger-500/20'}`}>
            {isSystemProcess ? (
              <ShieldAlert className="h-6 w-6 text-warning-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-danger-500" />
            )}
          </div>
          <h3 className={`text-xl font-bold ${isSystemProcess ? 'text-warning-500' : 'text-dark-50'}`}>
            {isSystemProcess ? '¡Proceso Crítico!' : 'Confirmar Acción'}
          </h3>
        </div>

        {isSystemProcess && (
          <div className="mb-4 p-3 bg-warning-500/10 border border-warning-500/20 rounded-lg">
            <p className="text-warning-200 text-sm font-medium leading-relaxed">
              ⚠️ Este proceso parece ser del sistema o una tarea crítica. Finalizarlo podría desestabilizar tu sistema.
            </p>
          </div>
        )}

        <p className="text-dark-300 mb-4 leading-relaxed">
          ¿Estás seguro que deseas finalizar este proceso? Esto podría causar pérdida de datos no guardados.
        </p>

        <div className="bg-dark-900/50 rounded-xl p-4 mb-6 space-y-2 border border-dark-800">
          <div className="flex justify-between items-center">
            <span className="text-dark-400 text-sm">Proceso:</span>
            <span className="text-dark-100 font-mono font-bold tracking-tight">{processName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-dark-400 text-sm">Puerto:</span>
            <span className="text-dark-100 font-mono font-bold tracking-tight">{port}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn flex-1 bg-dark-700 hover:bg-dark-600 text-dark-100 transition-all font-semibold"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className={`${isSystemProcess ? 'bg-warning-600 hover:bg-warning-700' : 'bg-danger-600 hover:bg-danger-700'} flex-1 py-2.5 rounded-lg text-white font-bold transition-all shadow-lg active:scale-95`}
          >
            Sí, Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
