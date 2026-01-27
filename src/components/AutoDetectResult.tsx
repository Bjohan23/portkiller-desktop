import { SearchCode, XCircle, Box, Cpu } from 'lucide-react';
import type { PortScanResult } from '../types';

interface AutoDetectResultProps {
  results: PortScanResult[];
  onSelect: (port: number) => void;
  onKill: (port: number) => void;
  isLoading: boolean;
  theme?: 'dark' | 'light';
}

export function AutoDetectResult({ 
  results, 
  onSelect, 
  onKill, 
  isLoading,
  theme = 'dark' 
}: AutoDetectResultProps) {
  if (isLoading) {
    return (
      <div className={`card mt-6 flex flex-col items-center justify-center py-10 ${theme === 'light' ? 'bg-white border-gray-200' : ''}`}>
        <SearchCode className="w-10 h-10 text-primary-500 animate-pulse mb-3" />
        <p className="text-dark-400 font-medium animate-pulse">Escaneando puertos comunes...</p>
      </div>
    );
  }

  const inUseCount = results.filter(r => r.inUse).length;

  if (inUseCount === 0) {
    return (
      <div className={`card mt-6 ${theme === 'light' ? 'bg-white border-gray-200' : ''}`}>
        <div className="flex flex-col items-center py-4">
             <SearchCode className="w-8 h-8 text-dark-500 mb-2" />
             <p className="text-dark-400">No se detectaron puertos comunes en uso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card mt-6 animate-slide-up ${theme === 'light' ? 'bg-white border-gray-200' : ''}`}>
      <div className="flex items-center gap-2 mb-4">
        <SearchCode className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-bold">Puertos Detectados ({inUseCount})</h2>
      </div>

      <div className="grid gap-3">
        {results.filter(r => r.inUse).map((res) => (
          <div 
            key={res.port}
            onClick={() => onSelect(res.port)}
            className={`
              flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
              ${theme === 'light' 
                ? 'bg-gray-50 border-gray-100 hover:border-primary-500/30' 
                : 'bg-dark-900/50 border-dark-700 hover:border-primary-500/30'}
              group
            `}
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-500/10 text-primary-500 px-3 py-1.5 rounded-lg font-mono font-bold text-center min-w-[65px]">
                {res.port}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{res.process?.name || 'Proceso'}</span>
                <div className="flex items-center gap-2 mt-0.5">
                    {res.process?.isDocker && (
                         <span className="text-[9px] font-bold text-blue-500 flex items-center gap-0.5">
                             <Box className="w-2.5 h-2.5" /> DOCKER
                         </span>
                    )}
                    {res.process?.framework && (
                         <span className="text-[9px] font-bold text-primary-500 flex items-center gap-0.5 uppercase">
                             <Cpu className="w-2.5 h-2.5" /> {res.process.framework}
                         </span>
                    )}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onKill(res.port);
              }}
              className="p-2 rounded-lg bg-danger-500/10 text-danger-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-danger-500 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
