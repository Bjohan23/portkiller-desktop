/**
 * Tipos TypeScript para el frontend
 * Coinciden con las estructuras definidas en el backend
 */

export enum ErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PORT_FREE = 'PORT_FREE',
  PORT_INVALID = 'PORT_INVALID',
  PROCESS_NOT_FOUND = 'PROCESS_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ProcessInfo {
  name: string;
  pid: number;
  path: string;
  command: string;
  user?: string;
}

export interface PortScanResult {
  port: number;
  inUse: boolean;
  process?: ProcessInfo;
}

export interface KillProcessResult {
  killed: boolean;
  port: number;
  pid?: number;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: ErrorType;
  message: string;
  suggestion?: string;
}

export type OperationResult<T = unknown> = SuccessResponse<T> | ErrorResponse;
