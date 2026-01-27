/**
 * Módulo para manejar permisos y verificación de acceso
 * Proporciona funciones para detectar y manejar problemas de permisos
 */

import type { ErrorType } from './types';

/**
 * Verifica si la aplicación está ejecutándose con permisos elevados
 * @returns true si tiene permisos de administrador/root
 */
export async function hasElevatedPermissions(): Promise<boolean> {
  try {
    if (process.platform === 'win32') {
      // En Windows, intentar acceder a un recurso que requiere admin
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        // Intentar ejecutar un comando que requiere permisos
        await execAsync('net session');
        return true;
      } catch {
        return false;
      }
    } else {
      // En Unix/Linux/Mac, verificar si el usuario es root
      return process.getuid?.() === 0;
    }
  } catch {
    return false;
  }
}

/**
 * Obtiene un mensaje de error formateado según el tipo de error
 * @param errorType - Tipo de error
 * @param context - Contexto adicional para el mensaje
 * @returns Mensaje de error y sugerencia
 */
export function getErrorMessage(
  errorType: ErrorType,
  context?: string
): { message: string; suggestion?: string } {
  switch (errorType) {
    case 'PERMISSION_DENIED':
      return {
        message: 'No tienes permisos suficientes para realizar esta acción',
        suggestion: process.platform === 'win32'
          ? 'Ejecuta PortKiller como Administrador (clic derecho → Ejecutar como administrador)'
          : 'Ejecuta PortKiller con sudo o como root',
      };

    case 'PORT_FREE':
      return {
        message: context ? `El puerto ${context} está libre` : 'El puerto está libre',
        suggestion: 'No hay ningún proceso usando este puerto',
      };

    case 'PORT_INVALID':
      return {
        message: context
          ? `El puerto ${context} no es válido`
          : 'Número de puerto inválido',
        suggestion: 'Ingresa un número entre 1 y 65535',
      };

    case 'PROCESS_NOT_FOUND':
      return {
        message: 'No se encontró el proceso',
        suggestion: 'El proceso podría haber terminado recientemente',
      };

    case 'UNKNOWN_ERROR':
    default:
      return {
        message: context || 'Ocurrió un error inesperado',
        suggestion: 'Intenta nuevamente o ejecuta la aplicación como administrador',
      };
  }
}

/**
 * Verifica si el sistema operativo soporta las operaciones de la aplicación
 * @returns true si el SO es soportado
 */
export function isOperatingSystemSupported(): boolean {
  const platform = process.platform;
  return platform === 'win32' || platform === 'darwin' || platform === 'linux';
}

/**
 * Obtiene el nombre amigable del sistema operativo actual
 * @returns Nombre del sistema operativo
 */
export function getOperatingSystemName(): string {
  switch (process.platform) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return 'Unknown';
  }
}
