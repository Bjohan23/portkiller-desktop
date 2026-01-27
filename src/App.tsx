/**
 * Aplicación Principal PortKiller Desktop
 * Gestiona el estado y orquesta todos los componentes
 */

import { useState } from 'react';
import { Zap } from 'lucide-react';
import { PortInput } from './components/PortInput';
import { SearchButton } from './components/SearchButton';
import { ProcessPanel } from './components/ProcessPanel';
import { KillButton } from './components/KillButton';
import { ConfirmDialog } from './components/ConfirmDialog';
import {
  FeedbackMessage,
  errorTypeToFeedbackType,
  type FeedbackType,
} from './components/FeedbackMessage';
import { findPort, killPort } from './services/tauri.service';
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
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    type: 'success',
    message: '',
  });

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
  const showFeedback = (
    type: FeedbackType,
    message: string,
    suggestion?: string
  ) => {
    setFeedback({ show: true, type, message, suggestion });
  };

  /**
   * Maneja la búsqueda de puerto
   */
  const handleSearch = async () => {
    if (!isValidPort) return;

    setIsSearching(true);
    setScanResult(null);
    setFeedback({ ...feedback, show: false });

    try {
      const result = await findPort(portNumber);

      if (result.success) {
        setScanResult(result.data);

        if (!result.data.inUse) {
          showFeedback(
            'success',
            `El puerto ${portNumber} está libre`,
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
  };

  /**
   * Maneja la confirmación del modal
   */
  const handleConfirmKill = async () => {
    setShowConfirmDialog(false);
    setIsKilling(true);
    setFeedback({ ...feedback, show: false });

    try {
      const result = await killPort(portNumber);

      if (result.success && result.data.killed) {
        showFeedback(
          'success',
          'Puerto liberado correctamente',
          `El proceso fue terminado exitosamente`
        );

        // Limpiar el resultado después de matar el proceso
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
   * Maneja Enter para buscar
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidPort && !isSearching) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6 selection:bg-primary-500/30">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 shadow-lg shadow-primary-500/5">
            <Zap className="h-8 w-8 text-primary-500 fill-primary-500/20" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
            PortKiller <span className="text-primary-500">Desktop</span>
          </h1>
          <p className="text-dark-400 text-lg max-w-md mx-auto leading-relaxed">
            Localiza y termina procesos que bloquean tus puertos de desarrollo en segundos.
          </p>
        </header>

        {/* Formulario de búsqueda */}
        <div className="card">
          <div className="space-y-4" onKeyPress={handleKeyPress}>
            <PortInput
              value={portValue}
              onChange={setPortValue}
              disabled={isSearching || isKilling}
            />

            <SearchButton
              onClick={handleSearch}
              loading={isSearching}
              disabled={!isValidPort || isKilling}
            />
          </div>

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

        {/* Modal de confirmación */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          processName={scanResult?.process?.name || ''}
          port={portNumber}
          onConfirm={handleConfirmKill}
          onCancel={() => setShowConfirmDialog(false)}
        />

        {/* Footer */}
        <footer className="text-center mt-12 text-dark-500 text-sm">
          <p>Hecho con ❤️ usando Tauri + React + TypeScript</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
