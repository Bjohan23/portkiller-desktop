/**
 * Módulo para terminar procesos de manera segura
 * Implementa lógica específica para cada sistema operativo
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { KillProcessResult, OperationResult, ErrorType } from './types';

const execAsync = promisify(exec);

/**
 * Determina si un error es por falta de permisos
 * @param error - Error a analizar
 * @returns true si el error es por permisos insuficientes
 */
function isPermissionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const message = error.message.toLowerCase();
  
  return (
    message.includes('access denied') ||
    message.includes('access is denied') ||
    message.includes('permission denied') ||
    message.includes('operation not permitted') ||
    message.includes('requires elevation')
  );
}

/**
 * Mata un proceso usando su PID
 * @param pid - ID del proceso a terminar
 * @returns Resultado de la operación
 */
async function killProcessByPid(pid: number): Promise<OperationResult<boolean>> {
  try {
    let command: string;

    if (process.platform === 'win32') {
      // Windows: usar taskkill con fuerza
      command = `taskkill /F /PID ${pid}`;
    } else {
      // Unix/Linux/Mac: usar kill
      command = `kill -9 ${pid}`;
    }

    await execAsync(command);

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    // Verificar si es un error de permisos
    if (isPermissionError(error)) {
      return {
        success: false,
        error: 'PERMISSION_DENIED' as ErrorType,
        message: 'No tienes permisos suficientes para terminar este proceso',
        suggestion: process.platform === 'win32'
          ? 'Ejecuta la aplicación como Administrador'
          : 'Ejecuta la aplicación con sudo',
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR' as ErrorType,
      message: `Error al intentar terminar el proceso: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

/**
 * Encuentra el PID del proceso que está usando un puerto específico
 * @param port - Número de puerto
 * @returns PID del proceso o null si no se encuentra
 */
async function findPidByPort(port: number): Promise<number | null> {
  try {
    let command: string;
    
    if (process.platform === 'win32') {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -t -i:${port}`;
    }

    const { stdout } = await execAsync(command);

    if (process.platform === 'win32') {
      // En Windows, extraer el PID de la última columna
      const lines = stdout.trim().split('\n');
      if (lines.length > 0) {
        const match = lines[0].match(/\s+(\d+)\s*$/);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    } else {
      // En Unix, el comando ya retorna solo el PID
      const pid = parseInt(stdout.trim(), 10);
      if (!isNaN(pid)) {
        return pid;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Termina el proceso que está usando un puerto específico
 * @param port - Número de puerto
 * @returns Resultado de la operación con detalles del proceso terminado
 */
export async function killProcessByPort(
  port: number
): Promise<OperationResult<KillProcessResult>> {
  try {
    // Primero, encontrar el PID del proceso
    const pid = await findPidByPort(port);

    if (!pid) {
      return {
        success: false,
        error: 'PROCESS_NOT_FOUND' as ErrorType,
        message: `No se encontró ningún proceso usando el puerto ${port}`,
        suggestion: 'El puerto podría estar libre o el proceso terminó recientemente',
      };
    }

    // Intentar matar el proceso
    const killResult = await killProcessByPid(pid);

    if (!killResult.success) {
      return killResult as OperationResult<KillProcessResult>;
    }

    // Esperar un momento para que el proceso termine
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: {
        killed: true,
        port,
        pid,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'UNKNOWN_ERROR' as ErrorType,
      message: `Error inesperado al intentar terminar el proceso del puerto ${port}`,
      suggestion: 'Intenta ejecutar la aplicación como administrador',
    };
  }
}

/**
 * Verifica si un puerto está libre después de intentar matar un proceso
 * @param port - Número de puerto a verificar
 * @returns true si el puerto está libre
 */
export async function isPortFree(port: number): Promise<boolean> {
  const pid = await findPidByPort(port);
  return pid === null;
}
