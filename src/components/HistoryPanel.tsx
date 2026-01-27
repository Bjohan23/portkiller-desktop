import { History, Trash2, RotateCcw, Clock } from 'lucide-react';

export interface HistoryItem {
  id: string;
  port: number;
  processName: string;
  pid?: number;
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onReKill: (port: number) => void;
  onClear: () => void;
  theme?: 'dark' | 'light';
}

export function HistoryPanel({ 
  history, 
  onReKill, 
  onClear,
  theme = 'dark' 
}: HistoryPanelProps) {
  if (history.length === 0) return null;

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(ts));
  };

  return (
    <div className={`card mt-8 animate-slide-up ${theme === 'light' ? 'bg-white border-gray-200' : ''}`}>
      <div className="flex items-center justify-between mb-4 border-b border-dark-700 pb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-bold">Historial Reciente</h2>
        </div>
        <button
          onClick={onClear}
          className="p-2 text-dark-400 hover:text-danger-500 transition-colors"
          title="Limpiar historial"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              theme === 'light' 
                ? 'bg-gray-50 border-gray-100 hover:bg-gray-100' 
                : 'bg-dark-900/50 border-dark-700 hover:bg-dark-700/50'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2 font-mono font-bold">
                <span className="text-primary-500">{item.port}</span>
                <span className="text-dark-400 font-normal">→</span>
                <span className="truncate max-w-[150px]">{item.processName}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-dark-500 font-medium">
                <Clock className="w-3 h-3" />
                <span>{formatDate(item.timestamp)}</span>
                {item.pid && <span>• PID: {item.pid}</span>}
              </div>
            </div>

            <button
              onClick={() => onReKill(item.port)}
              className="p-2 rounded-lg bg-danger-500/10 text-danger-500 hover:bg-danger-500 hover:text-white transition-all active:scale-95"
              title="Terminar de nuevo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
