/**
 * Componente para mostrar mensajes de feedback al usuario
 * Soporta success, warning, y error con auto-dismiss
 */

import { useEffect } from 'react';
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
    if (type === 'success') {
      return (
        <svg
          className={`h-6 w-6 ${currentStyle.icon}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }

    if (type === 'warning') {
      return (
        <svg
          className={`h-6 w-6 ${currentStyle.icon}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    }

    return (
      <svg
        className={`h-6 w-6 ${currentStyle.icon}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  };

  return (
    <div
      className={`border rounded-lg p-4 ${currentStyle.container} animate-slide-up mt-4`}
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
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
