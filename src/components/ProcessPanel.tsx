import { Activity, Hash, Folder, Terminal, User, Globe, Box, Cpu } from 'lucide-react';
import type { ProcessInfo } from '../types';

interface ProcessPanelProps {
  port: number;
  process: ProcessInfo;
}

export function ProcessPanel({ port, process }: ProcessPanelProps) {
  const InfoRow = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string; 
    value?: string | number; 
    icon: any 
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-2 border-b border-dark-800/50 last:border-0 hover:bg-dark-800/30 px-2 rounded-md transition-colors">
      <div className="flex items-center gap-2 min-w-[140px]">
        <Icon className="h-4 w-4 text-dark-400" />
        <span className="text-dark-400 font-medium text-sm">{label}:</span>
      </div>
      <span className="text-dark-100 font-mono text-sm break-all font-medium">
        {value || 'N/A'}
      </span>
    </div>
  );

  return (
    <div className="card animate-slide-up mt-6 border border-dark-700 shadow-xl overflow-hidden">
      <div className="bg-dark-800/50 px-6 py-4 flex items-center justify-between border-b border-dark-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-5 w-5 text-success-500" />
            <div className="absolute inset-0 h-5 w-5 bg-success-500/20 blur-sm rounded-full animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-dark-50">Puerto en Uso</h2>
        </div>
        <div className="flex items-center gap-2">
            {process.isDocker && (
                <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                    <Box className="w-3 h-3" /> DOCKER
                </span>
            )}
            <span className="bg-success-500/10 text-success-500 text-[10px] font-bold px-2 py-0.5 rounded border border-success-500/20">
                ACTIVO
            </span>
        </div>
      </div>

      <div className="p-6 space-y-1">
        <InfoRow label="Puerto" value={port} icon={Globe} />
        <InfoRow label="Proceso" value={process.name} icon={Activity} />
        
        {process.framework && (
             <InfoRow label="Framework" value={process.framework} icon={Cpu} />
        )}

        <InfoRow label="PID" value={process.pid} icon={Hash} />
        
        {process.path && (
          <InfoRow label="Ruta" value={process.path} icon={Folder} />
        )}
        
        {process.command && (
          <InfoRow label="Comando" value={process.command} icon={Terminal} />
        )}
        
        {process.user && (
          <InfoRow label="Usuario" value={process.user} icon={User} />
        )}
      </div>
    </div>
  );
}
