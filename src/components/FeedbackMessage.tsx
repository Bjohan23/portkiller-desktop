import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import type { ErrorType } from '../types';

export type FeedbackType = 'success' | 'warning' | 'error';

interface FeedbackMessageProps {
  type: FeedbackType;
  message: string;
  suggestion?: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export function FeedbackMessage({
  type,
  message,
  suggestion,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: FeedbackMessageProps) {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, onDismiss]);

  const styles = {
    success: {
      container: 'bg-success-500/10 border-success-500/50',
      icon: 'text-success-500',
      text: 'text-success-100',
    },
    warning: {
      container: 'bg-warning-500/10 border-warning-500/50',
      icon: 'text-warning-500',
      text: 'text-warning-100',
    },
    error: {
      container: 'bg-danger-500/10 border-danger-500/50',
      icon: 'text-danger-500',
      text: 'text-danger-100',
    },
  };

  const currentStyle = styles[type];

  const Icon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className={`h-6 w-6 ${currentStyle.icon}`} />;
      case 'warning':
        return <AlertTriangle className={`h-6 w-6 ${currentStyle.icon}`} />;
      default:
        return <XCircle className={`h-6 w-6 ${currentStyle.icon}`} />;
    }
  };

  return (
    <div
      className={`border rounded-lg p-4 ${currentStyle.container} animate-slide-up mt-4 shadow-lg backdrop-blur-sm`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon />
        <div className="flex-1">
          <p className={`font-medium ${currentStyle.text}`}>{message}</p>
          {suggestion && (
            <p className="text-dark-300 text-sm mt-1">{suggestion}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-dark-400 hover:text-dark-200 transition-colors"
            aria-label="Cerrar mensaje"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Helper para convertir ErrorType a FeedbackType
 */
export function errorTypeToFeedbackType(errorType: ErrorType): FeedbackType {
  switch (errorType) {
    case 'PERMISSION_DENIED':
      return 'warning';
    case 'PORT_FREE':
      return 'success';
    default:
      return 'error';
  }
}
