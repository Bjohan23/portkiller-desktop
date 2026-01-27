/**
 * Panel para mostrar información del proceso
 * Se muestra solo cuando el puerto está en uso
 */

import type { ProcessInfo } from '../types';

interface ProcessPanelProps {
  port: number;
  process: ProcessInfo;
}

export function ProcessPanel({ port, process }: ProcessPanelProps) {
  const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span className="text-dark-400 font-medium min-w-[120px]">{label}:</span>
      <span className="text-dark-100 font-mono text-sm break-all">
        {value || 'N/A'}
      </span>
    </div>
  );

  return (
    <div className="card animate-slide-up mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse-slow" />
        <h2 className="text-xl font-semibold text-dark-50">Puerto en Uso</h2>
      </div>

      <div className="space-y-3">
        <InfoRow label="Puerto" value={port} />
        <InfoRow label="Estado" value="En uso" />
        <InfoRow label="Proceso" value={process.name} />
        <InfoRow label="PID" value={process.pid} />
        
        {process.path && (
          <div className="border-t border-dark-700 pt-3 mt-3">
            <InfoRow label="Ruta" value={process.path} />
          </div>
        )}
        
        {process.command && (
          <InfoRow label="Comando" value={process.command} />
        )}
        
        {process.user && (
          <InfoRow label="Usuario" value={process.user} />
        )}
      </div>
    </div>
  );
}
