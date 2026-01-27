/**
 * Tipos y enumeraciones para la aplicación PortKiller
 * Siguiendo principios de Clean Code: tipos bien definidos y documentados
 */

/**
 * Errores posibles en la aplicación
 */
export enum ErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PORT_FREE = 'PORT_FREE',
  PORT_INVALID = 'PORT_INVALID',
  PROCESS_NOT_FOUND = 'PROCESS_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Información detallada de un proceso
 */
export interface ProcessInfo {
  /** Nombre del proceso (ej: main.exe) */
  name: string;
  /** ID del proceso */
  pid: number;
  /** Ruta completa del ejecutable */
  path: string;
  /** Comando completo de ejecución */
  command: string;
  /** Usuario que ejecuta el proceso (si está disponible) */
  user?: string;
}

/**
 * Resultado de escanear un puerto
 */
export interface PortScanResult {
  /** Número de puerto escaneado */
  port: number;
  /** Indica si el puerto está en uso */
  inUse: boolean;
  /** Información del proceso (solo si está en uso) */
  process?: ProcessInfo;
}

/**
 * Respuesta exitosa de operación
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Respuesta de error de operación
 */
export interface ErrorResponse {
  success: false;
  error: ErrorType;
  message: string;
  /** Sugerencia para resolver el error */
  suggestion?: string;
}

/**
 * Tipo genérico para respuestas de operaciones
 */
export type OperationResult<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Resultado de intentar matar un proceso
 */
export interface KillProcessResult {
  /** Indica si el proceso fue terminado exitosamente */
  killed: boolean;
  /** Puerto que fue liberado */
  port: number;
  /** PID del proceso que fue terminado (si aplica) */
  pid?: number;
}
