/**
 * Módulo para escanear puertos y obtener información de procesos
 * Utiliza zombie-port-killer para detección cross-platform
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { PortScanResult, ProcessInfo, OperationResult, ErrorType } from './types';

const execAsync = promisify(exec);

/**
 * Valida que el número de puerto sea válido
 * @param port - Número de puerto a validar
 * @returns true si el puerto es válido (1-65535)
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

/**
 * Parsea la información de un proceso desde la salida de netstat o lsof
 * @param output - Salida del comando del sistema
 * @param port - Puerto a buscar
 * @returns Información del proceso o null si no se encuentra
 */
function parseProcessInfo(output: string, port: number): ProcessInfo | null {
  try {
    const lines = output.split('\n');
    
    // Buscar la línea que contiene el puerto
    for (const line of lines) {
      if (line.includes(`:${port}`) || line.includes(` ${port} `)) {
        // Intentar extraer PID (esto varía según el SO)
        const pidMatch = line.match(/\s+(\d+)\s+/);
        if (pidMatch) {
          const pid = parseInt(pidMatch[1], 10);
          
          // Obtener nombre del proceso
          const nameMatch = line.match(/([^\s/\\]+(?:\.exe)?)\s*$/i);
          const name = nameMatch ? nameMatch[1] : 'Unknown';
          
          return {
            name,
            pid,
            path: '', // Se llenará después si es posible
            command: line.trim(),
            user: undefined,
          };
        }
      }
    }
  } catch (error) {
    console.error('Error parsing process info:', error);
  }
  
  return null;
}

/**
 * Obtiene información adicional del proceso usando su PID
 * @param pid - ID del proceso
 * @returns Información adicional del proceso
 */
async function getProcessDetails(pid: number): Promise<Partial<ProcessInfo>> {
  try {
    // En Windows, usar wmic o tasklist
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`wmic process where ProcessId=${pid} get ExecutablePath,CommandLine /format:list`);
      
      const pathMatch = stdout.match(/ExecutablePath=(.*)/);
      const cmdMatch = stdout.match(/CommandLine=(.*)/);
      
      return {
        path: pathMatch ? pathMatch[1].trim() : '',
        command: cmdMatch ? cmdMatch[1].trim() : '',
      };
    } else {
      // En Unix/Linux/Mac, usar ps
      const { stdout } = await execAsync(`ps -p ${pid} -o command=`);
      
      return {
        path: '',
        command: stdout.trim(),
      };
    }
  } catch (error) {
    return {
      path: '',
      command: '',
    };
  }
}

/**
 * Escanea un puerto para determinar si está en uso y obtener información del proceso
 * @param port - Número de puerto a escanear
 * @returns Resultado del escaneo con información del proceso si está en uso
 */
export async function scanPort(port: number): Promise<OperationResult<PortScanResult>> {
  // Validar puerto
  if (!isValidPort(port)) {
    return {
      success: false,
      error: 'PORT_INVALID' as ErrorType,
      message: `El puerto ${port} no es válido. Debe estar entre 1 y 65535.`,
      suggestion: 'Ingresa un número de puerto válido',
    };
  }

  try {
    let command: string;
    
    // Comando específico para cada sistema operativo
    if (process.platform === 'win32') {
      // Windows: usar netstat
      command = `netstat -ano | findstr :${port}`;
    } else {
      // Unix/Linux/Mac: usar lsof
      command = `lsof -i :${port}`;
    }

    const { stdout } = await execAsync(command);

    // Si hay salida, el puerto está en uso
    if (stdout.trim()) {
      const processInfo = parseProcessInfo(stdout, port);
      
      if (processInfo) {
        // Obtener detalles adicionales del proceso
        const details = await getProcessDetails(processInfo.pid);
        
        const completeProcessInfo: ProcessInfo = {
          ...processInfo,
          path: details.path || processInfo.path,
          command: details.command || processInfo.command,
        };

        return {
          success: true,
          data: {
            port,
            inUse: true,
            process: completeProcessInfo,
          },
        };
      }
    }

    // Puerto libre
    return {
      success: true,
      data: {
        port,
        inUse: false,
      },
    };
  } catch (error) {
    // Si el comando falla, generalmente significa que el puerto está libre
    // (en Windows, findstr retorna error si no encuentra nada)
    const isCommandNotFound = error instanceof Error && 
      (error.message.includes('not found') || error.message.includes('no se encuentra'));
    
    if (!isCommandNotFound) {
      return {
        success: true,
        data: {
          port,
          inUse: false,
        },
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR' as ErrorType,
      message: `Error al escanear el puerto ${port}`,
      suggestion: 'Intenta ejecutar la aplicación como administrador',
    };
  }
}
