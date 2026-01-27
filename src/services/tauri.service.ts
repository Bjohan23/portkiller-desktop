/**
 * Servicio para comunicación con Tauri backend
 * Abstrae las llamadas invoke de Tauri
 */

import { invoke } from '@tauri-apps/api/core';
import { ErrorType } from '../types';
import type {
  OperationResult,
  PortScanResult,
  KillProcessResult,
} from '../types';

/**
 * Busca información sobre un puerto específico
 * @param port - Número de puerto a buscar
 * @returns Resultado del escaneo con información del proceso
 */
export async function findPort(
  port: number
): Promise<OperationResult<PortScanResult>> {
  try {
    const result = await invoke<OperationResult<PortScanResult>>('find_port', {
      port,
    });
    return result;
  } catch (error) {
    return {
      success: false,
      error: ErrorType.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'Error desconocido',
      suggestion: 'Intenta nuevamente o contacta soporte',
    };
  }
}

/**
 * Intenta terminar el proceso que está usando un puerto
 * @param port - Número de puerto del proceso a terminar
 * @returns Resultado de la operación
 */
export async function killPort(
  port: number
): Promise<OperationResult<KillProcessResult>> {
  try {
    const result = await invoke<OperationResult<KillProcessResult>>(
      'kill_port',
      { port }
    );
    return result;
  } catch (error) {
    return {
      success: false,
      error: ErrorType.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : 'Error desconocido',
      suggestion: 'Intenta ejecutar la aplicación como administrador',
    };
  }
}
