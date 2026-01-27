/**
 * Aplicación Principal PortKiller Desktop
 * Gestiona el estado y orquesta todos los componentes
 */

import { useState, useEffect, useCallback } from 'react';
import { Zap, Sun, Moon, SearchCode } from 'lucide-react';
import { PortInput } from './components/PortInput';
import { SearchButton } from './components/SearchButton';
import { ProcessPanel } from './components/ProcessPanel';
import { KillButton } from './components/KillButton';
import { ConfirmDialog } from './components/ConfirmDialog';
import { FavoriteChips } from './components/FavoriteChips';
import { HistoryPanel, type HistoryItem } from './components/HistoryPanel';
import { AutoDetectResult } from './components/AutoDetectResult';
import { WatchMode } from './components/WatchMode';
import {
  FeedbackMessage,
  errorTypeToFeedbackType,
  type FeedbackType,
} from './components/FeedbackMessage';
import { findPort, killPort, detectCommonPorts } from './services/tauri.service';
import type { PortScanResult } from './types';
import './App.css';

interface FeedbackState {
  show: boolean;
  type: FeedbackType;
  message: string;
  suggestion?: string;
}

function App() {
  // Estados
  const [portValue, setPortValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isKilling, setIsKilling] = useState(false);
  const [scanResult, setScanResult] = useState<PortScanResult | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    type: 'success',
    message: '',
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('kill_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [autoDetectResults, setAutoDetectResults] = useState<PortScanResult[] | null>(null);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  // Validación de puerto
  const portNumber = parseInt(portValue);
  const isValidPort =
    portValue !== '' &&
    !isNaN(portNumber) &&
    portNumber >= 1 &&
    portNumber <= 65535;

  /**
   * Muestra un mensaje de feedback
   */
  const showFeedback = useCallback((
    type: FeedbackType,
    message: string,
    suggestion?: string
  ) => {
    setFeedback({ show: true, type, message, suggestion });
  }, []);

  /**
   * Maneja la búsqueda de puerto
   */
  const handleSearch = useCallback(async (forcedPort?: number) => {
    const targetPort = forcedPort ?? portNumber;
    if (isNaN(targetPort) || targetPort < 1 || targetPort > 65535) return;

    setIsSearching(true);
    setScanResult(null);
    setFeedback({ ...feedback, show: false });
    setAutoDetectResults(null);

    try {
      const result = await findPort(targetPort);

      if (result.success) {
        setScanResult(result.data);

        if (!result.data.inUse) {
          showFeedback(
            'success',
            `El puerto ${targetPort} está libre`,
            'No hay ningún proceso usando este puerto'
          );
        }
      } else {
        showFeedback(
          errorTypeToFeedbackType(result.error),
          result.message,
          result.suggestion
        );
      }
    } catch (error) {
      showFeedback(
        'error',
        'Error inesperado al buscar el puerto',
        'Intenta nuevamente'
      );
    } finally {
      setIsSearching(false);
    }
  }, [portNumber, feedback, showFeedback]);

  /**
   * Agrega un item al historial
   */
  const addToHistory = useCallback((port: number, processName: string, pid?: number) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      port,
      processName,
      pid,
      timestamp: Date.now(),
    };
    
    setHistory(prev => {
      const filtered = prev.filter(item => item.port !== port).slice(0, 9);
      const newHistory = [newItem, ...filtered];
      localStorage.setItem('kill_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  /**
   * Maneja la confirmación del modal
   */
  const handleConfirmKill = async () => {
    const targetPort = scanResult?.port || portNumber;
    const currentInUse = scanResult?.inUse ? scanResult : autoDetectResults?.find(r => r.port === targetPort);
    
    const procName = currentInUse?.process?.name || history.find(h => h.port === targetPort)?.processName || 'Proceso desconocido';
    const procPid = currentInUse?.process?.pid || history.find(h => h.port === targetPort)?.pid;

    setShowConfirmDialog(false);
    setIsKilling(true);
    setFeedback({ ...feedback, show: false });

    try {
      const result = await killPort(targetPort);

      if (result.success && result.data.killed) {
        showFeedback(
          'success',
          'Puerto liberado correctamente',
          `El proceso fue terminado exitosamente`
        );

        addToHistory(targetPort, procName, procPid);

        if (autoDetectResults) {
            setAutoDetectResults(prev => prev ? prev.map(r => r.port === targetPort ? { ...r, inUse: false, process: undefined } : r) : null);
        }

        setScanResult(null);
        setPortValue('');
      } else if (!result.success && result.error && result.message) {
        showFeedback(
          errorTypeToFeedbackType(result.error),
          result.message,
          result.suggestion
        );
      }
    } catch (error) {
      showFeedback(
        'error',
        'Error al intentar terminar el proceso',
        'Intenta ejecutar la aplicación como administrador'
      );
    } finally {
      setIsKilling(false);
    }
  };

  /**
   * Maneja el auto-detectado de puertos
   */
  const handleAutoDetect = async () => {
    setIsAutoDetecting(true);
    setScanResult(null);
    setFeedback({ ...feedback, show: false });
    
    try {
        const result = await detectCommonPorts();
        if (result.success) {
            setAutoDetectResults(result.data);
            const inUseCount = result.data.filter(r => r.inUse).length;
            if (inUseCount === 0) {
                showFeedback('success', 'No se detectaron puertos comunes ocupados');
            }
        }
    } catch (error) {
        showFeedback('error', 'Error al escanear puertos comunes');
    } finally {
        setIsAutoDetecting(false);
    }
  };

  /**
   * Toggle Theme
   */
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // Aplicar tema al body
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        document.getElementById('port-input')?.focus();
      }
      
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }

      const activeResult = scanResult?.inUse || autoDetectResults?.some(r => r.inUse);
      if (e.ctrlKey && e.shiftKey && e.key === 'X' && activeResult) {
        e.preventDefault();
        setShowConfirmDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, scanResult, autoDetectResults]);

  /**
   * Maneja Enter para buscar
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidPort && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-900 shadow-inner' : 'bg-gray-100'} p-6 selection:bg-primary-500/30 font-inter`}>
      <div className="max-w-2xl mx-auto">
        {/* Top Controls */}
        <div className="flex justify-end items-center gap-3 mb-4">
          <button
             onClick={handleAutoDetect}
             disabled={isAutoDetecting || isSearching}
             className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold transition-all ${
               theme === 'dark' 
                 ? 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10' 
                 : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-primary-500/50 hover:bg-primary-50/50 shadow-sm'
             }`}
          >
            <SearchCode className={`w-4 h-4 ${isAutoDetecting ? 'animate-spin' : ''}`} />
            Auto-Detectar
          </button>
          
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-dark-800 border-dark-700 text-warning-400 hover:bg-dark-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 shadow-lg shadow-primary-500/5">
            <Zap className="h-8 w-8 text-primary-500 fill-primary-500/20" />
          </div>
          <h1 className={`text-4xl font-black mb-3 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-dark-900'}`}>
            PortKiller <span className="text-primary-500">Desktop</span>
          </h1>
          <p className={`${theme === 'dark' ? 'text-dark-400' : 'text-gray-600'} text-lg max-w-md mx-auto leading-relaxed font-medium`}>
            Localiza y termina procesos que bloquean tus puertos de desarrollo en segundos.
          </p>
        </header>

        {/* Formulario de búsqueda */}
        <div className={`card ${theme === 'light' ? 'bg-white border-gray-200 shadow-md' : 'shadow-2xl shadow-black/20'}`}>
          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <PortInput
              value={portValue}
              onChange={setPortValue}
              disabled={isSearching || isKilling}
            />

            <FavoriteChips 
              onSelect={(p) => {
                setPortValue(p);
                handleSearch(parseInt(p));
              }}
              disabled={isSearching || isKilling}
            />

            <SearchButton
              onClick={() => handleSearch()}
              loading={isSearching}
              disabled={!isValidPort || isKilling}
            />
          </div>

          <WatchMode port={isValidPort ? portNumber : 0} theme={theme} />

          {/* Mensajes de feedback */}
          {feedback.show && (
            <FeedbackMessage
              type={feedback.type}
              message={feedback.message}
              suggestion={feedback.suggestion}
              onDismiss={() => setFeedback({ ...feedback, show: false })}
            />
          )}
        </div>

        {/* Resultados de Auto-Detección */}
        {(isAutoDetecting || autoDetectResults) && (
             <AutoDetectResult 
                results={autoDetectResults || []}
                theme={theme}
                isLoading={isAutoDetecting}
                onSelect={(p) => {
                    setPortValue(p.toString());
                    handleSearch(p);
                }}
                onKill={(p) => {
                    setPortValue(p.toString());
                    const res = autoDetectResults?.find(r => r.port === p);
                    if (res) {
                        setScanResult(res);
                        setShowConfirmDialog(true);
                    }
                }}
             />
        )}

        {/* Panel de proceso (solo si está en uso) */}
        {scanResult?.inUse && scanResult.process && (
          <>
            <ProcessPanel port={scanResult.port} process={scanResult.process} />

            <KillButton
              onClick={() => setShowConfirmDialog(true)}
              loading={isKilling}
              disabled={isSearching}
            />
          </>
        )}

        {/* Historial */}
        <HistoryPanel 
          history={history}
          theme={theme}
          onReKill={(p) => {
            setPortValue(p.toString());
            handleSearch(p);
          }}
          onClear={() => {
            setHistory([]);
            localStorage.removeItem('kill_history');
          }}
        />

        {/* Modal de confirmación */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          processName={scanResult?.process?.name || autoDetectResults?.find(r => r.port === portNumber)?.process?.name || ''}
          port={portNumber || scanResult?.port || 0}
          isSystemProcess={scanResult?.process?.pid !== undefined && scanResult.process.pid < 500}
          onConfirm={handleConfirmKill}
          onCancel={() => setShowConfirmDialog(false)}
        />

        {/* Footer */}
        <footer className={`text-center mt-12 text-sm ${theme === 'dark' ? 'text-dark-500' : 'text-gray-400'} animate-fade-in`}>
          <p className="font-medium">Hecho con ❤️ usando Tauri + React + TypeScript</p>
          <div className="flex justify-center gap-4 mt-3 opacity-60">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-current font-mono text-[10px]">Ctrl+K</kbd> <span className="text-[11px] font-bold uppercase tracking-wider">Buscar</span></span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-current font-mono text-[10px]">Ctrl+D</kbd> <span className="text-[11px] font-bold uppercase tracking-wider">Tema</span></span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
