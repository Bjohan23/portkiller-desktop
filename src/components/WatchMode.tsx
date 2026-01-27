import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Bell, BellOff, Loader2 } from 'lucide-react';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { findPort } from '../services/tauri.service';

interface WatchModeProps {
  port: number;
  theme?: 'dark' | 'light';
}

export function WatchMode({ port, theme = 'dark' }: WatchModeProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastStatus, setLastStatus] = useState<boolean | null>(null);

  // Verificar permisos al montar
  useEffect(() => {
    const checkPermission = async () => {
      let permission = await isPermissionGranted();
      if (!permission) {
        permission = await requestPermission() === 'granted';
      }
      setHasPermission(permission);
    };
    checkPermission();
  }, []);

  const toggleWatch = () => {
    setIsWatching(!isWatching);
    if (!isWatching) {
      setLastStatus(null);
    }
  };

  // Lógica de monitoreo
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWatching && port > 0) {
      interval = setInterval(async () => {
        try {
          const result = await findPort(port);
          if (result.success) {
            const inUse = result.data.inUse;
            
            // Si el estado cambia de LIBRE a OCUPADO
            if (lastStatus === false && inUse === true) {
              if (hasPermission) {
                sendNotification({
                  title: '¡Puerto Ocupado!',
                  body: `El puerto ${port} ahora está siendo usado por ${result.data.process?.name || 'un proceso'}.`,
                  icon: 'system-error'
                });
              }
            }
            
            setLastStatus(inUse);
          }
        } catch (error) {
          console.error('Watch Mode Error:', error);
        }
      }, 5000); // Cada 5 segundos
    }

    return () => clearInterval(interval);
  }, [isWatching, port, lastStatus, hasPermission]);

  if (port === 0) return null;

  return (
    <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
      isWatching 
        ? (theme === 'dark' ? 'bg-primary-500/10 border-primary-500/30' : 'bg-primary-50 border-primary-200 shadow-inner')
        : (theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200')
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isWatching ? 'bg-primary-500 text-white animate-pulse' : 'bg-dark-700 text-dark-400'}`}>
            {isWatching ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </div>
          <div>
            <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-dark-900'}`}>
              Modo Centinela
            </h3>
            <p className="text-[10px] text-dark-400 font-medium">
              {isWatching ? `Vigilando puerto ${port}...` : `Monitorear el puerto ${port}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {!hasPermission && (
                <button 
                    onClick={async () => setHasPermission(await requestPermission() === 'granted')}
                    className="p-1.5 text-warning-500 hover:bg-warning-500/10 rounded-lg transition-colors"
                    title="Activar notificaciones"
                >
                    <BellOff className="w-4 h-4" />
                </button>
            )}
            
            <button
                onClick={toggleWatch}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                    isWatching 
                    ? 'bg-danger-500/10 text-danger-500 hover:bg-danger-500 hover:text-white'
                    : 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                }`}
            >
                {isWatching ? 'Detener' : 'Iniciar'}
            </button>
        </div>
      </div>
      
      {isWatching && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-primary-500 font-bold bg-primary-500/5 p-2 rounded-lg border border-primary-500/10">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Escaneando cada 5 segundos. Te avisaremos si algo cambia.</span>
        </div>
      )}
    </div>
  );
}
